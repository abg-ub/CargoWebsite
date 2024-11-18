import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Label,
} from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { useState } from "react";

interface ComboBoxItem {
  id: number | string;
  name: string;
}

interface ComboBoxProps {
  label: string;
  items: ComboBoxItem[];
  name: string;
  error?: string;
  onChange: (value: string) => void;
  defaultValue?: string;
}

export default function ComboBox({
  label,
  items,
  name,
  error,
  onChange,
  defaultValue,
}: ComboBoxProps) {
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<ComboBoxItem | null>(
    defaultValue
      ? items.find((item) => item.name === defaultValue) ?? null
      : null
  );

  const filteredItems =
    query === ""
      ? items
      : items.filter((item) => {
          return item.name.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <Combobox
      as="div"
      value={selectedItem}
      onChange={(item) => {
        setQuery("");
        setSelectedItem(item);
        onChange(item ? item.name : "");
      }}
    >
      <Label className="block text-sm font-medium leading-6 text-gray-900">
        {label}
      </Label>
      <div className="relative mt-2">
        <ComboboxInput
          name={name}
          className={`w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ${
            error ? "ring-red-500" : "ring-gray-300"
          } focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6`}
          onChange={(event) => setQuery(event.target.value)}
          onBlur={() => setQuery("")}
          displayValue={(item: any) => item?.name}
        />
        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </ComboboxButton>

        {filteredItems.length > 0 && (
          <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredItems.map((item) => (
              <ComboboxOption
                key={item.id}
                value={item}
                className="group relative cursor-default select-none py-2 pl-8 pr-4 text-gray-900 data-[focus]:bg-primary data-[focus]:text-white"
              >
                <span className="block truncate group-data-[selected]:font-semibold">
                  {item.name}
                </span>

                <span className="absolute inset-y-0 left-0 hidden items-center pl-1.5 text-primary group-data-[selected]:flex group-data-[focus]:text-white">
                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                </span>
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </Combobox>
  );
}
