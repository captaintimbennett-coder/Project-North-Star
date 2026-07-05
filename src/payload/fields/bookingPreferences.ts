import type { Field } from "payload";

export const bookingPreferencesField: Field = {
  name: "bookingPreferences",
  type: "group",
  label: "Booking contact & notifications",
  admin: {
    description:
      "Private scheduling preferences. Contact details are shared only after a confirmed booking and only when explicitly approved here.",
  },
  fields: [
    {
      name: "email",
      type: "email",
      label: "Booking email",
      admin: {
        description: "Required before this participant can be used in a confirmed booking.",
      },
    },
    {
      name: "mobilePhone",
      type: "text",
      label: "Mobile phone",
    },
    {
      name: "shareEmail",
      type: "checkbox",
      defaultValue: true,
      label: "Share email after a confirmed booking",
    },
    {
      name: "shareInstagram",
      type: "checkbox",
      defaultValue: false,
      label: "Share Instagram after a confirmed booking",
    },
    {
      name: "shareMobilePhone",
      type: "checkbox",
      defaultValue: false,
      label: "Share mobile phone after a confirmed booking",
    },
    {
      name: "shareWebsite",
      type: "checkbox",
      defaultValue: false,
      label: "Share website after a confirmed booking",
    },
    {
      name: "notifyByEmail",
      type: "checkbox",
      defaultValue: true,
      label: "Email notifications (required)",
    },
    {
      name: "notifyBySms",
      type: "checkbox",
      defaultValue: false,
      label: "SMS notifications (future)",
    },
    {
      name: "notifyInDashboard",
      type: "checkbox",
      defaultValue: false,
      label: "Dashboard notifications (future)",
    },
  ],
};
