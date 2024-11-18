import {
  Form,
  useActionData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { z } from "zod";
import ComboBox from "./combo-box";
import { useState, useEffect } from "react";
import PhoneInput from "./phone-input";
import { CustomerFormErrors, Customer } from "~/types";

// Define the Zod schema for form validation
const customerSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Please enter a valid phone number"),
  country: z.string().min(2, "Please Select a Country"),
  city: z.string().min(2, "City is required"),
  address: z.string().min(5, "Address is required"),
});

interface CustomerFormProps {
  setOpen: (open: boolean) => void;
  customer?: Customer;
  onSubmit?: () => void;
}

export default function CustomerForm({
  setOpen,
  customer,
  onSubmit,
}: CustomerFormProps) {
  const actionData = useActionData<{
    errors?: CustomerFormErrors;
    success?: boolean;
  }>();
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = useState(customer?.phone || "");
  const isEditing = Boolean(customer);

  const isSubmitting = navigation.state === "submitting";

  // Use actionData for errors if available, otherwise use local state
  const [errors, setErrors] = useState<CustomerFormErrors>(
    actionData?.errors || {}
  );

  // Pre-fill form with customer data if editing
  useEffect(() => {
    if (customer) {
      console.log("Customer data:", customer);
      setPhoneNumber(customer.phone);
    }
  }, [customer]);

  const submit = useSubmit();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData);

    try {
      // Validate all fields
      customerSchema.parse({
        firstName: formJson.firstName,
        lastName: formJson.lastName,
        email: formJson.email,
        phone: formJson.phone,
        country: formJson.country,
        city: formJson.city,
        address: formJson.address,
      });

      // If validation passes, proceed with submission
      onSubmit?.();
      submit(formData, {
        method: customer ? "PUT" : "POST",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: CustomerFormErrors = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof CustomerFormErrors;
          if (field) {
            newErrors[field] = {
              message: err.message,
              type: err.code,
            };
          }
        });
        setErrors(newErrors);
        return; // Prevent form submission if there are errors
      }
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    const field = name as keyof typeof customerSchema.shape;

    try {
      customerSchema.pick({ [field]: true }).parse({ [field]: value });
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[field];
        return newErrors;
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.issues[0];
        setErrors((prevErrors) => ({
          ...prevErrors,
          [field]: {
            message: fieldError.message,
            type: fieldError.code,
          },
        }));
      }
    }
  };

  const handleCountryChange = (value: string) => {
    try {
      customerSchema.pick({ country: true }).parse({ country: value });
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors.country;
        return newErrors;
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const countryError = error.issues[0];
        setErrors((prevErrors) => ({
          ...prevErrors,
          country: {
            message: countryError.message,
            type: countryError.code,
          },
        }));
      }
    }
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    if (value) {
      try {
        customerSchema.pick({ phone: true }).parse({ phone: value });
        setErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors.phone;
          return newErrors;
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          const phoneError = error.issues[0];
          setErrors((prevErrors) => ({
            ...prevErrors,
            phone: {
              message: phoneError.message,
              type: phoneError.code,
            },
          }));
        }
      }
    }
  };

  // Update the renderField function to include onChange handler
  const renderField = (
    name: keyof CustomerFormErrors,
    label: string,
    type: string = "text",
    autoComplete?: string,
    defaultValue?: string
  ) => (
    <div className="sm:col-span-3">
      <label
        htmlFor={name}
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        {label}
      </label>
      <div className="mt-2">
        <input
          id={name}
          name={name}
          type={type}
          autoComplete={autoComplete}
          onChange={handleInputChange}
          defaultValue={defaultValue}
          className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
            errors[name] ? "ring-red-500" : "ring-gray-300"
          } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6`}
        />
      </div>
      {errors[name] && (
        <p className="mt-2 text-sm text-red-600">{errors[name]?.message}</p>
      )}
    </div>
  );

  return (
    <Form method={customer ? "put" : "post"} onSubmit={handleSubmit} noValidate>
      {customer && (
        <input
          type="hidden"
          name="id"
          value={customer.id}
          key={customer.id} // Add key to ensure React updates the value
        />
      )}

      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            {isEditing ? "Edit Customer" : "Customer Information"}
          </h2>

          {/* Update the input fields to show default values when editing */}
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            {renderField(
              "firstName",
              "First name",
              "text",
              "given-name",
              customer?.firstName
            )}
            {renderField(
              "lastName",
              "Last name",
              "text",
              "family-name",
              customer?.lastName
            )}
            {renderField(
              "email",
              "Email address",
              "email",
              "email",
              customer?.email
            )}

            <div className="sm:col-span-2">
              <PhoneInput
                onChange={handlePhoneChange}
                error={errors.phone?.message}
                value={phoneNumber}
              />
            </div>

            <div className="sm:col-span-2">
              <ComboBox
                label="Country"
                name="country"
                items={[
                  { id: 1, name: "Afghanistan" },
                  { id: 2, name: "Albania" },
                  { id: 3, name: "Algeria" },
                  { id: 4, name: "Andorra" },
                  { id: 5, name: "Angola" },
                  { id: 6, name: "Argentina" },
                  { id: 7, name: "Armenia" },
                  { id: 8, name: "Australia" },
                  { id: 9, name: "Austria" },
                  { id: 10, name: "Azerbaijan" },
                  { id: 11, name: "Bahrain" },
                  { id: 12, name: "Bangladesh" },
                  { id: 13, name: "Belarus" },
                  { id: 14, name: "Belgium" },
                  { id: 15, name: "Benin" },
                  { id: 16, name: "Bhutan" },
                  { id: 17, name: "Bolivia" },
                  { id: 18, name: "Bosnia and Herzegovina" },
                  { id: 19, name: "Botswana" },
                  { id: 20, name: "Brazil" },
                  { id: 21, name: "Brunei" },
                  { id: 22, name: "Bulgaria" },
                  { id: 23, name: "Burkina Faso" },
                  { id: 24, name: "Burundi" },
                  { id: 25, name: "Cambodia" },
                  { id: 26, name: "Cameroon" },
                  { id: 27, name: "Canada" },
                  { id: 28, name: "Cape Verde" },
                  { id: 29, name: "Chile" },
                  { id: 30, name: "China" },
                  { id: 31, name: "Colombia" },
                  { id: 32, name: "Comoros" },
                  { id: 33, name: "Costa Rica" },
                  { id: 34, name: "Cuba" },
                  { id: 35, name: "Cyprus" },
                  { id: 36, name: "Czech Republic" },
                  { id: 37, name: "Denmark" },
                  { id: 38, name: "Djibouti" },
                  { id: 39, name: "Dominican Republic" },
                  { id: 40, name: "Ecuador" },
                  { id: 41, name: "Egypt" },
                  { id: 42, name: "El Salvador" },
                  { id: 43, name: "Equatorial Guinea" },
                  { id: 44, name: "Eritrea" },
                  { id: 45, name: "Estonia" },
                  { id: 46, name: "Ethiopia" },
                  { id: 47, name: "Finland" },
                  { id: 48, name: "France" },
                  { id: 49, name: "Gabon" },
                  { id: 50, name: "Gambia" },
                  { id: 51, name: "Georgia" },
                  { id: 52, name: "Germany" },
                  { id: 53, name: "Ghana" },
                  { id: 54, name: "Greece" },
                  { id: 55, name: "Greenland" },
                  { id: 56, name: "Guatemala" },
                  { id: 57, name: "Guinea" },
                  { id: 58, name: "Haiti" },
                  { id: 59, name: "Honduras" },
                  { id: 60, name: "Hungary" },
                  { id: 61, name: "Iceland" },
                  { id: 62, name: "India" },
                  { id: 63, name: "Indonesia" },
                  { id: 64, name: "Iran" },
                  { id: 65, name: "Iraq" },
                  { id: 66, name: "Ireland" },
                  { id: 67, name: "Israel" },
                  { id: 68, name: "Italy" },
                  { id: 69, name: "Japan" },
                  { id: 70, name: "Jordan" },
                  { id: 71, name: "Kazakhstan" },
                  { id: 72, name: "Kenya" },
                  { id: 73, name: "Kiribati" },
                  { id: 74, name: "Korea (South)" },
                  { id: 75, name: "Kuwait" },
                  { id: 76, name: "Kyrgyzstan" },
                  { id: 77, name: "Laos" },
                  { id: 78, name: "Latvia" },
                  { id: 79, name: "Lebanon" },
                  { id: 80, name: "Lesotho" },
                  { id: 81, name: "Liberia" },
                  { id: 82, name: "Libya" },
                  { id: 83, name: "Liechtenstein" },
                  { id: 84, name: "Lithuania" },
                  { id: 85, name: "Luxembourg" },
                  { id: 86, name: "Madagascar" },
                  { id: 87, name: "Malawi" },
                  { id: 88, name: "Malaysia" },
                  { id: 89, name: "Maldives" },
                  { id: 90, name: "Mali" },
                  { id: 91, name: "Malta" },
                  { id: 92, name: "Marshall Islands" },
                  { id: 93, name: "Mauritania" },
                  { id: 94, name: "Mauritius" },
                  { id: 95, name: "Mexico" },
                  { id: 96, name: "Micronesia" },
                  { id: 97, name: "Moldova" },
                  { id: 98, name: "Monaco" },
                  { id: 99, name: "Mongolia" },
                  { id: 100, name: "Montenegro" },
                  { id: 101, name: "Morocco" },
                  { id: 102, name: "Mozambique" },
                  { id: 103, name: "Myanmar" },
                  { id: 104, name: "Namibia" },
                  { id: 105, name: "Nauru" },
                  { id: 106, name: "Nepal" },
                  { id: 107, name: "Netherlands" },
                  { id: 108, name: "New Zealand" },
                  { id: 109, name: "Nicaragua" },
                  { id: 110, name: "Niger" },
                  { id: 111, name: "Nigeria" },
                  { id: 112, name: "Norway" },
                  { id: 113, name: "Oman" },
                  { id: 114, name: "Pakistan" },
                  { id: 115, name: "Palau" },
                  { id: 116, name: "Panama" },
                  { id: 117, name: "Papua New Guinea" },
                  { id: 118, name: "Paraguay" },
                  { id: 119, name: "Peru" },
                  { id: 120, name: "Philippines" },
                  { id: 121, name: "Poland" },
                  { id: 122, name: "Portugal" },
                  { id: 123, name: "Qatar" },
                  { id: 124, name: "Romania" },
                  { id: 125, name: "Russia" },
                  { id: 126, name: "Rwanda" },
                  { id: 127, name: "Samoa" },
                  { id: 128, name: "San Marino" },
                  { id: 129, name: "Saudi Arabia" },
                  { id: 130, name: "Senegal" },
                  { id: 131, name: "Serbia" },
                  { id: 132, name: "Seychelles" },
                  { id: 133, name: "Sierra Leone" },
                  { id: 134, name: "Singapore" },
                  { id: 135, name: "Slovakia" },
                  { id: 136, name: "Slovenia" },
                  { id: 137, name: "Solomon Islands" },
                  { id: 138, name: "Somalia" },
                  { id: 139, name: "South Africa" },
                  { id: 140, name: "Spain" },
                  { id: 141, name: "Sri Lanka" },
                  { id: 142, name: "Sudan" },
                  { id: 143, name: "Suriname" },
                  { id: 144, name: "Sweden" },
                  { id: 145, name: "Switzerland" },
                  { id: 146, name: "Syria" },
                  { id: 147, name: "Taiwan" },
                  { id: 148, name: "Tajikistan" },
                  { id: 149, name: "Tanzania" },
                  { id: 150, name: "Thailand" },
                  { id: 151, name: "Togo" },
                  { id: 152, name: "Tonga" },
                  { id: 153, name: "Trinidad and Tobago" },
                  { id: 154, name: "Tunisia" },
                  { id: 155, name: "Turkey" },
                  { id: 156, name: "Uganda" },
                  { id: 157, name: "Ukraine" },
                  { id: 158, name: "United Arab Emirates" },
                  { id: 159, name: "United Kingdom" },
                  { id: 160, name: "United States" },
                  { id: 161, name: "Uruguay" },
                  { id: 162, name: "Uzbekistan" },
                  { id: 163, name: "Vanuatu" },
                  { id: 164, name: "Vatican City" },
                  { id: 165, name: "Venezuela" },
                  { id: 166, name: "Vietnam" },
                  { id: 167, name: "Yemen" },
                  { id: 168, name: "Zambia" },
                  { id: 169, name: "Zimbabwe" },
                ]}
                error={errors.country?.message}
                onChange={handleCountryChange}
                defaultValue={customer?.country}
              />
            </div>

            {renderField(
              "city",
              "City",
              "text",
              "address-level2",
              customer?.city
            )}

            <div className="col-span-full">
              <label
                htmlFor="address"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Address
              </label>
              <div className="mt-2">
                <textarea
                  id="address"
                  name="address"
                  rows={4}
                  autoComplete="street-address"
                  onChange={handleInputChange}
                  defaultValue={customer?.address}
                  className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                    errors.address ? "ring-red-500" : "ring-gray-300"
                  } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6`}
                />
              </div>
              {errors.address && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.address.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="button"
          className="text-sm font-semibold leading-6 text-gray-900"
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : isEditing ? "Update" : "Save"}
        </button>
      </div>
    </Form>
  );
}
