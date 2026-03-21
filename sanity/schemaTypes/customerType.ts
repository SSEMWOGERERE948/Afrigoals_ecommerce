import { UserIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const customerType = defineType({
  name: "customer",
  title: "Customer",
  type: "document",
  icon: UserIcon,
  groups: [
    { name: "details", title: "Customer Details", default: true },
    { name: "pesapal", title: "pesapal" },
  ],
  fields: [
    defineField({
      name: "email",
      type: "string",
      group: "details",
      validation: (rule) => [rule.required().error("Email is required")],
    }),
    defineField({
      name: "name",
      type: "string",
      group: "details",
      description: "Customer's full name",
    }),
    defineField({
      name: "clerkUserId",
      type: "string",
      group: "details",
      description: "Clerk user ID for authentication",
    }),
    defineField({
      name: "pesapalCustomerId",
      type: "string",
      group: "pesapal",
      readOnly: true,
      description: "pesapal customer ID for payments",
      validation: (rule) => [
        rule.required().error("pesapal customer ID is required"),
      ],
    }),
    defineField({
      name: "createdAt",
      type: "datetime",
      group: "details",
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      email: "email",
      name: "name",
      pesapalCustomerId: "pesapalCustomerId",
    },
    prepare({ email, name, pesapalCustomerId }) {
      return {
        title: name ?? email ?? "Unknown Customer",
        subtitle: pesapalCustomerId
          ? `${email ?? ""} • ${pesapalCustomerId}`
          : (email ?? ""),
      };
    },
  },
  orderings: [
    {
      title: "Newest First",
      name: "createdAtDesc",
      by: [{ field: "createdAt", direction: "desc" }],
    },
    {
      title: "Email A-Z",
      name: "emailAsc",
      by: [{ field: "email", direction: "asc" }],
    },
  ],
});
