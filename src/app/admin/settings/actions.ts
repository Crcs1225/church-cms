"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  ACTIVE_APP_USER_COOKIE,
  hasPermission,
  isValidAppRole,
  resolveCurrentUserByPublicId,
} from "@/lib/admin-access";
import { deleteLocalChurchLogo, getChurchLogoUploadError, saveChurchLogo } from "@/lib/church-logo";
import { getChurchSettings } from "@/lib/church-settings";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export type SettingsActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export const INITIAL_SETTINGS_ACTION_STATE: SettingsActionState = {
  status: "idle",
  message: null,
};

function successState(message: string): SettingsActionState {
  return {
    status: "success",
    message,
  };
}

function errorState(message: string): SettingsActionState {
  return {
    status: "error",
    message,
  };
}

async function requireSettingsPermission(permission: Parameters<typeof hasPermission>[1]) {
  const cookieStore = await cookies();
  const publicId = cookieStore.get(ACTIVE_APP_USER_COOKIE)?.value ?? null;
  const user = await resolveCurrentUserByPublicId(publicId);

  if (!user || !hasPermission(user, permission)) {
    return errorState("Your current role is not allowed to perform this action.");
  }

  return null;
}

function revalidateSettingsSurfaces() {
  revalidatePath("/admin");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/members");
  revalidatePath("/admin/events");
  revalidatePath("/admin/finances");
  revalidatePath("/admin/finances/income");
  revalidatePath("/admin/finances/expenses");
  revalidatePath("/admin/finances/income/print");
  revalidatePath("/admin/finances/expenses/print");
}

export async function saveChurchProfileAction(
  _previousState: SettingsActionState,
  formData: FormData,
) {
  const permissionError = await requireSettingsPermission("settings:church-profile");

  if (permissionError) {
    return permissionError;
  }

  const churchName = String(formData.get("churchName") ?? "").trim();
  const shortName = String(formData.get("shortName") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!churchName) {
    return errorState("Church name is required.");
  }

  if (!shortName) {
    return errorState("Short name is required.");
  }

  const existing = await getChurchSettings();

  const settings = await prisma.churchSettings.update({
    where: {
      singletonKey: "default",
    },
    data: {
      churchName,
      shortName,
      contactEmail: contactEmail || null,
      address: address || null,
      phone: phone || null,
    },
    select: {
      publicId: true,
      churchName: true,
      shortName: true,
      contactEmail: true,
      address: true,
      phone: true,
      logoPath: true,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "CHURCH_SETTINGS_UPDATE",
      entityType: "church-settings",
      entityPublicId: settings.publicId,
      description: "Updated church profile settings.",
      metadataJson: JSON.stringify({
        before: existing,
        after: settings,
      }),
    },
  });

  revalidateSettingsSurfaces();
  return successState("Church profile updated.");
}

export async function uploadChurchLogoAction(
  _previousState: SettingsActionState,
  formData: FormData,
) {
  const permissionError = await requireSettingsPermission("settings:church-profile");

  if (permissionError) {
    return permissionError;
  }

  const file = formData.get("logo");

  if (!(file instanceof File)) {
    return errorState("A church logo file is required.");
  }

  const uploadError = getChurchLogoUploadError(file);

  if (uploadError) {
    return errorState(uploadError);
  }

  const existing = await getChurchSettings();
  const nextLogoPath = await saveChurchLogo(file);

  const settings = await prisma.churchSettings.update({
    where: {
      singletonKey: "default",
    },
    data: {
      logoPath: nextLogoPath,
    },
    select: {
      publicId: true,
      logoPath: true,
    },
  });

  await deleteLocalChurchLogo(existing.logoPath);

  await prisma.activityLog.create({
    data: {
      action: "CHURCH_LOGO_UPDATE",
      entityType: "church-settings",
      entityPublicId: settings.publicId,
      description: "Updated church logo.",
      metadataJson: JSON.stringify({
        before: existing.logoPath,
        after: settings.logoPath,
      }),
    },
  });

  revalidateSettingsSurfaces();
  return successState("Church logo updated.");
}

export async function toggleNotificationSettingAction(
  _previousState: SettingsActionState,
  formData: FormData,
) {
  const permissionError = await requireSettingsPermission("settings:notifications");

  if (permissionError) {
    return permissionError;
  }

  const key = String(formData.get("key") ?? "").trim();
  const nextValue = String(formData.get("value") ?? "").trim() === "true";
  const existing = await getChurchSettings();

  if (
    key !== "dailyDigestEnabled" &&
    key !== "newMemberAlertsEnabled" &&
    key !== "lowBudgetWarningEnabled"
  ) {
    return errorState("Notification setting is invalid.");
  }

  const settings = await prisma.churchSettings.update({
    where: {
      singletonKey: "default",
    },
    data: {
      [key]: nextValue,
    },
    select: {
      publicId: true,
      dailyDigestEnabled: true,
      newMemberAlertsEnabled: true,
      lowBudgetWarningEnabled: true,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "NOTIFICATION_SETTINGS_UPDATE",
      entityType: "church-settings",
      entityPublicId: settings.publicId,
      description: "Updated notification settings.",
      metadataJson: JSON.stringify({
        before: {
          dailyDigestEnabled: existing.dailyDigestEnabled,
          newMemberAlertsEnabled: existing.newMemberAlertsEnabled,
          lowBudgetWarningEnabled: existing.lowBudgetWarningEnabled,
        },
        after: settings,
      }),
    },
  });

  revalidateSettingsSurfaces();
  return successState("Notification settings updated.");
}

export async function saveReportSignatoryAction(
  _previousState: SettingsActionState,
  formData: FormData,
) {
  const permissionError = await requireSettingsPermission("settings:signatories");

  if (permissionError) {
    return permissionError;
  }

  const publicId = String(formData.get("publicId") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!publicId) {
    return errorState("Report signatory ID is required.");
  }

  if (!fullName) {
    return errorState("Signatory full name is required.");
  }

  const existing = await prisma.reportSignatory.findUnique({
    where: { publicId },
    select: {
      publicId: true,
      roleSlug: true,
      roleName: true,
      fullName: true,
      title: true,
      email: true,
      phone: true,
    },
  });

  if (!existing) {
    return errorState("Report signatory not found.");
  }

  const signatory = await prisma.reportSignatory.update({
    where: { publicId },
    data: {
      fullName,
      title: title || null,
      email: email || null,
      phone: phone || null,
    },
    select: {
      publicId: true,
      roleSlug: true,
      roleName: true,
      fullName: true,
      title: true,
      email: true,
      phone: true,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "REPORT_SIGNATORY_UPDATE",
      entityType: "report-signatory",
      entityPublicId: signatory.publicId,
      description: `Updated report signatory for ${signatory.roleName}.`,
      metadataJson: JSON.stringify({
        roleSlug: signatory.roleSlug,
        before: {
          fullName: existing.fullName,
          title: existing.title,
          email: existing.email,
          phone: existing.phone,
        },
        after: {
          fullName: signatory.fullName,
          title: signatory.title,
          email: signatory.email,
          phone: signatory.phone,
        },
      }),
    },
  });

  revalidateSettingsSurfaces();
  return successState("Report signatory updated.");
}

export async function saveAppUserAction(
  _previousState: SettingsActionState,
  formData: FormData,
) {
  const permissionError = await requireSettingsPermission("settings:users");

  if (permissionError) {
    return permissionError;
  }

  const publicId = String(formData.get("publicId") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() || "active";
  const isEdit = Boolean(publicId);

  if (!fullName) {
    return errorState("User full name is required.");
  }

  if (!email) {
    return errorState("User email is required.");
  }

  if (!role) {
    return errorState("User role is required.");
  }

  if (!isValidAppRole(role)) {
    return errorState("User role is invalid.");
  }

  try {
    if (isEdit) {
      const existing = await prisma.appUser.findUnique({
        where: { publicId },
        select: {
          publicId: true,
          fullName: true,
          email: true,
          role: true,
          status: true,
        },
      });

      if (!existing) {
        return errorState("Admin user not found.");
      }

      const user = await prisma.appUser.update({
        where: { publicId },
        data: {
          fullName,
          email,
          role,
          status,
        },
        select: {
          publicId: true,
          fullName: true,
          email: true,
          role: true,
          status: true,
        },
      });

      await prisma.activityLog.create({
        data: {
          action: "APP_USER_UPDATE",
          entityType: "app-user",
          entityPublicId: user.publicId,
          description: `Updated admin user ${user.fullName}.`,
          metadataJson: JSON.stringify({
            before: existing,
            after: user,
          }),
        },
      });

      revalidateSettingsSurfaces();
      return successState("Admin user updated.");
    }

    const user = await prisma.appUser.create({
      data: {
        fullName,
        email,
        role,
        status,
      },
      select: {
        publicId: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "APP_USER_CREATE",
        entityType: "app-user",
        entityPublicId: user.publicId,
        description: `Created admin user ${user.fullName}.`,
      },
    });

    revalidateSettingsSurfaces();
    return successState("Admin user created.");
  } catch (error) {
    const prismaError = error as { code?: string } | null;

    if (prismaError?.code === "P2002") {
      return errorState("An admin user with this email already exists.");
    }

    throw error;
  }
}

export async function deleteAppUserAction(
  _previousState: SettingsActionState,
  formData: FormData,
) {
  const permissionError = await requireSettingsPermission("settings:users");

  if (permissionError) {
    return permissionError;
  }

  const publicId = String(formData.get("publicId") ?? "").trim();

  if (!publicId) {
    return errorState("Admin user ID is required.");
  }

  const existing = await prisma.appUser.findUnique({
    where: { publicId },
    select: {
      publicId: true,
      fullName: true,
      email: true,
    },
  });

  if (!existing) {
    return errorState("Admin user not found.");
  }

  await prisma.appUser.delete({
    where: { publicId },
  });

  await prisma.activityLog.create({
    data: {
      action: "APP_USER_DELETE",
      entityType: "app-user",
      entityPublicId: publicId,
      description: `Deleted admin user ${existing.fullName}.`,
      metadataJson: JSON.stringify(existing),
    },
  });

  revalidateSettingsSurfaces();
  return successState("Admin user deleted.");
}

export async function saveFinanceCategoryAction(
  _previousState: SettingsActionState,
  formData: FormData,
) {
  const permissionError = await requireSettingsPermission("settings:categories");

  if (permissionError) {
    return permissionError;
  }

  const type = String(formData.get("type") ?? "").trim();
  const publicId = String(formData.get("publicId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const isRestricted = String(formData.get("isRestricted") ?? "").trim() === "on";
  const isEdit = Boolean(publicId);

  if (type !== "giving" && type !== "expense") {
    return errorState("Category type is invalid.");
  }

  if (!name) {
    return errorState("Category name is required.");
  }

  const slug = slugify(name);

  if (!slug) {
    return errorState("Category name is invalid.");
  }

  try {
    if (type === "giving") {
      if (isEdit) {
        const existing = await prisma.givingCategory.findUnique({
          where: { publicId },
          select: {
            publicId: true,
            name: true,
            slug: true,
            isRestricted: true,
          },
        });

        if (!existing) {
          return errorState("Income category not found.");
        }

        const category = await prisma.givingCategory.update({
          where: { publicId },
          data: {
            name,
            slug,
            isRestricted,
          },
          select: {
            publicId: true,
            name: true,
            slug: true,
            isRestricted: true,
          },
        });

        await prisma.activityLog.create({
          data: {
            action: "GIVING_CATEGORY_UPDATE",
            entityType: "giving-category",
            entityPublicId: category.publicId,
            description: `Updated income category ${category.name}.`,
            metadataJson: JSON.stringify({
              before: existing,
              after: category,
            }),
          },
        });

        revalidateSettingsSurfaces();
        return successState("Income category updated.");
      }

      const category = await prisma.givingCategory.create({
        data: {
          name,
          slug,
          isRestricted,
        },
        select: {
          publicId: true,
          name: true,
          slug: true,
          isRestricted: true,
        },
      });

      await prisma.activityLog.create({
        data: {
          action: "GIVING_CATEGORY_CREATE",
          entityType: "giving-category",
          entityPublicId: category.publicId,
          description: `Created income category ${category.name}.`,
        },
      });

      revalidateSettingsSurfaces();
      return successState("Income category created.");
    }

    if (isEdit) {
      const existing = await prisma.expenseCategory.findUnique({
        where: { publicId },
        select: {
          publicId: true,
          name: true,
          slug: true,
        },
      });

      if (!existing) {
        return errorState("Expense category not found.");
      }

      const category = await prisma.expenseCategory.update({
        where: { publicId },
        data: {
          name,
          slug,
        },
        select: {
          publicId: true,
          name: true,
          slug: true,
        },
      });

      await prisma.activityLog.create({
        data: {
          action: "EXPENSE_CATEGORY_UPDATE",
          entityType: "expense-category",
          entityPublicId: category.publicId,
          description: `Updated expense category ${category.name}.`,
          metadataJson: JSON.stringify({
            before: existing,
            after: category,
          }),
        },
      });

      revalidateSettingsSurfaces();
      return successState("Expense category updated.");
    }

    const category = await prisma.expenseCategory.create({
      data: {
        name,
        slug,
      },
      select: {
        publicId: true,
        name: true,
        slug: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "EXPENSE_CATEGORY_CREATE",
        entityType: "expense-category",
        entityPublicId: category.publicId,
        description: `Created expense category ${category.name}.`,
      },
    });

    revalidateSettingsSurfaces();
    return successState("Expense category created.");
  } catch (error) {
    const prismaError = error as { code?: string } | null;

    if (prismaError?.code === "P2002") {
      return errorState(
        type === "giving"
          ? "An income category with this name already exists."
          : "An expense category with this name already exists.",
      );
    }

    throw error;
  }
}

export async function deleteFinanceCategoryAction(
  _previousState: SettingsActionState,
  formData: FormData,
) {
  const permissionError = await requireSettingsPermission("settings:categories");

  if (permissionError) {
    return permissionError;
  }

  const type = String(formData.get("type") ?? "").trim();
  const publicId = String(formData.get("publicId") ?? "").trim();

  if (type !== "giving" && type !== "expense") {
    return errorState("Category type is invalid.");
  }

  if (!publicId) {
    return errorState("Category ID is required.");
  }

  if (type === "giving") {
    const existing = await prisma.givingCategory.findUnique({
      where: { publicId },
      select: {
        publicId: true,
        name: true,
        slug: true,
        _count: {
          select: {
            contributions: true,
          },
        },
      },
    });

    if (!existing) {
      return errorState("Income category not found.");
    }

    if (existing._count.contributions > 0) {
      return errorState(
        "This income category is already used by contributions and cannot be deleted.",
      );
    }

    await prisma.givingCategory.delete({
      where: { publicId },
    });

    await prisma.activityLog.create({
      data: {
        action: "GIVING_CATEGORY_DELETE",
        entityType: "giving-category",
        entityPublicId: publicId,
        description: `Deleted income category ${existing.name}.`,
        metadataJson: JSON.stringify(existing),
      },
    });

    revalidateSettingsSurfaces();
    return successState("Income category deleted.");
  }

  const existing = await prisma.expenseCategory.findUnique({
    where: { publicId },
    select: {
      publicId: true,
      name: true,
      slug: true,
      _count: {
        select: {
          expenses: true,
        },
      },
    },
  });

  if (!existing) {
    return errorState("Expense category not found.");
  }

  if (existing._count.expenses > 0) {
    return errorState(
      "This expense category is already used by expenses and cannot be deleted.",
    );
  }

  await prisma.expenseCategory.delete({
    where: { publicId },
  });

  await prisma.activityLog.create({
    data: {
      action: "EXPENSE_CATEGORY_DELETE",
      entityType: "expense-category",
      entityPublicId: publicId,
      description: `Deleted expense category ${existing.name}.`,
      metadataJson: JSON.stringify(existing),
    },
  });

  revalidateSettingsSurfaces();
  return successState("Expense category deleted.");
}
