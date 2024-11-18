import React, { useState, useEffect, useCallback } from "react";

export default function PhoneInput({
  onChange,
  error,
  value,
}: {
  onChange: (value: string) => void;
  error?: string;
  value?: string;
}) {
  const countries = [
    { code: "AFG", phoneCode: "+93" },
    { code: "ALB", phoneCode: "+355" },
    { code: "DZA", phoneCode: "+213" },
    { code: "AND", phoneCode: "+376" },
    { code: "AGO", phoneCode: "+244" },
    { code: "ARG", phoneCode: "+54" },
    { code: "ARM", phoneCode: "+374" },
    { code: "AUS", phoneCode: "+61" },
    { code: "AUT", phoneCode: "+43" },
    { code: "AZE", phoneCode: "+994" },
    { code: "BHR", phoneCode: "+973" },
    { code: "BGD", phoneCode: "+880" },
    { code: "BLR", phoneCode: "+375" },
    { code: "BEL", phoneCode: "+32" },
    { code: "BEN", phoneCode: "+229" },
    { code: "BTN", phoneCode: "+975" },
    { code: "BOL", phoneCode: "+591" },
    { code: "BIH", phoneCode: "+387" },
    { code: "BWA", phoneCode: "+267" },
    { code: "BRA", phoneCode: "+55" },
    { code: "BRN", phoneCode: "+673" },
    { code: "BGR", phoneCode: "+359" },
    { code: "BFA", phoneCode: "+226" },
    { code: "BDI", phoneCode: "+257" },
    { code: "KHM", phoneCode: "+855" },
    { code: "CMR", phoneCode: "+237" },
    { code: "CAN", phoneCode: "+1" },
    { code: "CPV", phoneCode: "+238" },
    { code: "CHL", phoneCode: "+56" },
    { code: "CHN", phoneCode: "+86" },
    { code: "COL", phoneCode: "+57" },
    { code: "COM", phoneCode: "+269" },
    { code: "CRI", phoneCode: "+506" },
    { code: "CUB", phoneCode: "+53" },
    { code: "CYP", phoneCode: "+357" },
    { code: "CZE", phoneCode: "+420" },
    { code: "DNK", phoneCode: "+45" },
    { code: "DJI", phoneCode: "+253" },
    { code: "DOM", phoneCode: "+1-809" },
    { code: "ECU", phoneCode: "+593" },
    { code: "EGY", phoneCode: "+20" },
    { code: "SLV", phoneCode: "+503" },
    { code: "GNQ", phoneCode: "+240" },
    { code: "ERI", phoneCode: "+291" },
    { code: "EST", phoneCode: "+372" },
    { code: "ETH", phoneCode: "+251" },
    { code: "FIN", phoneCode: "+358" },
    { code: "FRA", phoneCode: "+33" },
    { code: "GAB", phoneCode: "+241" },
    { code: "GMB", phoneCode: "+220" },
    { code: "GEO", phoneCode: "+995" },
    { code: "DEU", phoneCode: "+49" },
    { code: "GHA", phoneCode: "+233" },
    { code: "GRC", phoneCode: "+30" },
    { code: "GRL", phoneCode: "+299" },
    { code: "GTM", phoneCode: "+502" },
    { code: "GIN", phoneCode: "+224" },
    { code: "HTI", phoneCode: "+509" },
    { code: "HND", phoneCode: "+504" },
    { code: "HUN", phoneCode: "+36" },
    { code: "ISL", phoneCode: "+354" },
    { code: "IND", phoneCode: "+91" },
    { code: "IDN", phoneCode: "+62" },
    { code: "IRN", phoneCode: "+98" },
    { code: "IRQ", phoneCode: "+964" },
    { code: "IRL", phoneCode: "+353" },
    { code: "ISR", phoneCode: "+972" },
    { code: "ITA", phoneCode: "+39" },
    { code: "JPN", phoneCode: "+81" },
    { code: "JOR", phoneCode: "+962" },
    { code: "KAZ", phoneCode: "+7" },
    { code: "KEN", phoneCode: "+254" },
    { code: "KIR", phoneCode: "+686" },
    { code: "KOR", phoneCode: "+82" },
    { code: "KWT", phoneCode: "+965" },
    { code: "KGZ", phoneCode: "+996" },
    { code: "LAO", phoneCode: "+856" },
    { code: "LVA", phoneCode: "+371" },
    { code: "LBN", phoneCode: "+961" },
    { code: "LSO", phoneCode: "+266" },
    { code: "LBR", phoneCode: "+231" },
    { code: "LBY", phoneCode: "+218" },
    { code: "LIE", phoneCode: "+423" },
    { code: "LTU", phoneCode: "+370" },
    { code: "LUX", phoneCode: "+352" },
    { code: "MDG", phoneCode: "+261" },
    { code: "MWI", phoneCode: "+265" },
    { code: "MYS", phoneCode: "+60" },
    { code: "MDV", phoneCode: "+960" },
    { code: "MLI", phoneCode: "+223" },
    { code: "MLT", phoneCode: "+356" },
    { code: "MHL", phoneCode: "+692" },
    { code: "MRT", phoneCode: "+222" },
    { code: "MUS", phoneCode: "+230" },
    { code: "MEX", phoneCode: "+52" },
    { code: "FSM", phoneCode: "+691" },
    { code: "MDA", phoneCode: "+373" },
    { code: "MCO", phoneCode: "+377" },
    { code: "MNG", phoneCode: "+976" },
    { code: "MNE", phoneCode: "+382" },
    { code: "MAR", phoneCode: "+212" },
    { code: "MOZ", phoneCode: "+258" },
    { code: "MMR", phoneCode: "+95" },
    { code: "NAM", phoneCode: "+264" },
    { code: "NRU", phoneCode: "+674" },
    { code: "NPL", phoneCode: "+977" },
    { code: "NLD", phoneCode: "+31" },
    { code: "NZL", phoneCode: "+64" },
    { code: "NIC", phoneCode: "+505" },
    { code: "NER", phoneCode: "+227" },
    { code: "NGA", phoneCode: "+234" },
    { code: "NOR", phoneCode: "+47" },
    { code: "OMN", phoneCode: "+968" },
    { code: "PAK", phoneCode: "+92" },
    { code: "PLW", phoneCode: "+680" },
    { code: "PAN", phoneCode: "+507" },
    { code: "PNG", phoneCode: "+675" },
    { code: "PRY", phoneCode: "+595" },
    { code: "PER", phoneCode: "+51" },
    { code: "PHL", phoneCode: "+63" },
    { code: "POL", phoneCode: "+48" },
    { code: "PRT", phoneCode: "+351" },
    { code: "QAT", phoneCode: "+974" },
    { code: "ROU", phoneCode: "+40" },
    { code: "RUS", phoneCode: "+7" },
    { code: "RWA", phoneCode: "+250" },
    { code: "WSM", phoneCode: "+685" },
    { code: "SMR", phoneCode: "+378" },
    { code: "SAU", phoneCode: "+966" },
    { code: "SEN", phoneCode: "+221" },
    { code: "SRB", phoneCode: "+381" },
    { code: "SYC", phoneCode: "+248" },
    { code: "SLE", phoneCode: "+232" },
    { code: "SGP", phoneCode: "+65" },
    { code: "SVK", phoneCode: "+421" },
    { code: "SVN", phoneCode: "+386" },
    { code: "SLB", phoneCode: "+677" },
    { code: "SOM", phoneCode: "+252" },
    { code: "ZAF", phoneCode: "+27" },
    { code: "ESP", phoneCode: "+34" },
    { code: "LKA", phoneCode: "+94" },
    { code: "SDN", phoneCode: "+249" },
    { code: "SUR", phoneCode: "+597" },
    { code: "SWZ", phoneCode: "+268" },
    { code: "SWE", phoneCode: "+46" },
    { code: "CHE", phoneCode: "+41" },
    { code: "SYR", phoneCode: "+963" },
    { code: "TWN", phoneCode: "+886" },
    { code: "TJK", phoneCode: "+992" },
    { code: "TZA", phoneCode: "+255" },
    { code: "THA", phoneCode: "+66" },
    { code: "TLS", phoneCode: "+670" },
    { code: "TGO", phoneCode: "+228" },
    { code: "TON", phoneCode: "+676" },
    { code: "TTO", phoneCode: "+1-868" },
    { code: "TUN", phoneCode: "+216" },
    { code: "TUR", phoneCode: "+90" },
    { code: "TKM", phoneCode: "+993" },
    { code: "TUV", phoneCode: "+688" },
    { code: "UGA", phoneCode: "+256" },
    { code: "UKR", phoneCode: "+380" },
    { code: "ARE", phoneCode: "+971" },
    { code: "GBR", phoneCode: "+44" },
    { code: "USA", phoneCode: "+1" },
    { code: "URY", phoneCode: "+598" },
    { code: "UZB", phoneCode: "+998" },
    { code: "VUT", phoneCode: "+678" },
    { code: "VAT", phoneCode: "+379" },
    { code: "VEN", phoneCode: "+58" },
    { code: "VNM", phoneCode: "+84" },
    { code: "YEM", phoneCode: "+967" },
    { code: "ZMB", phoneCode: "+260" },
    { code: "ZWE", phoneCode: "+263" },
  ];

  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [displayPhoneNumber, setDisplayPhoneNumber] = useState("");

  useEffect(() => {
    if (value) {
      const country = countries.find((c) => value.startsWith(c.phoneCode));
      if (country) {
        setSelectedCountry(country);
        setDisplayPhoneNumber(
          country.phoneCode + " " + value.slice(country.phoneCode.length)
        );
      } else {
        setDisplayPhoneNumber(value);
      }
    } else {
      setDisplayPhoneNumber(selectedCountry.phoneCode + " ");
    }
  }, [value]);

  const handleCountryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = event.target.value;
    const country = countries.find((c) => c.phoneCode === selectedCode);
    if (country) {
      setSelectedCountry(country);
      const newPhoneNumber = country.phoneCode + " ";
      setDisplayPhoneNumber(newPhoneNumber);
      onChange(newPhoneNumber.trim());
    }
  };

  const handlePhoneNumberChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const input = event.target.value;
      const phoneNumberPart = input
        .slice(selectedCountry.phoneCode.length)
        .trim();
      const numericPhoneNumberPart = phoneNumberPart.replace(/\D/g, "");
      const newPhoneNumber =
        selectedCountry.phoneCode + " " + numericPhoneNumberPart;
      setDisplayPhoneNumber(newPhoneNumber);

      // Call onChange with the cleaned phone number
      const finalPhoneNumber = (
        selectedCountry.phoneCode + numericPhoneNumberPart
      ).replace(/\s+/g, "");
      onChange(finalPhoneNumber);
    },
    [selectedCountry, onChange]
  );

  return (
    <div>
      <label
        htmlFor="phone-number"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        Phone Number
      </label>
      <div className="relative mt-2 rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 flex items-center">
          <label htmlFor="country" className="sr-only">
            Country
          </label>
          <select
            id="country"
            name="country"
            autoComplete="country"
            className="h-full rounded-md border-0 bg-transparent py-0 pl-3 pr-7 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
            value={selectedCountry.phoneCode}
            onChange={handleCountryChange}
          >
            {countries.map((country) => (
              <option key={country.code} value={country.phoneCode}>
                {country.code}
              </option>
            ))}
          </select>
        </div>
        <input
          id="phone-number"
          name="phone"
          type="tel"
          value={displayPhoneNumber}
          onChange={handlePhoneNumberChange}
          className={`block w-full rounded-md border-0 py-1.5 pl-20 text-gray-900 ring-1 ring-inset ${
            error ? "ring-red-500" : "ring-gray-300"
          } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6`}
          pattern="\+?[0-9\s]+"
          inputMode="tel"
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
