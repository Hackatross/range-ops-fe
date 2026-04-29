import { Lock, Shield, UserRound } from "lucide-react";
import { field, section } from "@/components/form/form-system";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "trainer", label: "Trainer" },
  { value: "viewer", label: "Viewer" },
];

/**
 * formkit schema for the User create/edit form.
 *
 * `roles` is rendered as a multi-select; the form layer joins the array
 * back into the canonical comma-separated string the backend stores.
 * Password is required on create, optional on edit (omit to leave unchanged).
 */
export const createUserFormSchema = ({ isEdit }: { isEdit: boolean }) => ({
  sections: [
    section(
      "identity",
      "Identity",
      [
        field.text("name", "Full name", {
          placeholder: "Cpl. Karim Hossain",
          required: true,
        }),
        field.email("email", "Email", {
          placeholder: "name@bd-army.local",
          required: true,
          autoComplete: "email",
        }),
      ],
      { cols: 2, icon: <UserRound className="h-4 w-4" /> },
    ),
    section(
      "access",
      "Access",
      [
        field.multiselect("roles", "Roles", ROLE_OPTIONS, {
          required: true,
          description:
            "A user can hold more than one — admin grants user management, trainer can run sessions.",
        }),
      ],
      { cols: 1, icon: <Shield className="h-4 w-4" /> },
    ),
    section(
      "credentials",
      isEdit ? "Reset password (optional)" : "Initial password",
      [
        field.password("password", isEdit ? "New password" : "Password", {
          placeholder: isEdit
            ? "Leave blank to keep current password"
            : "Min. 8 characters",
          required: !isEdit,
          autoComplete: isEdit ? "new-password" : "new-password",
        }),
      ],
      { cols: 1, icon: <Lock className="h-4 w-4" /> },
    ),
  ],
});
