import { Link } from "@remix-run/react";

const faqs = [
  {
    id: 1,
    question: "How long does shipping take?",
    answer:
      "Shipping times vary depending on the destination and shipping method. Standard shipping usually takes 5-7 business days, while express shipping can be as fast as 2-3 business days.",
  },
  {
    id: 2,
    question: "What shipping carriers do you use?",
    answer:
      "We partner with various trusted carriers, including UPS, FedEx, and DHL, to ensure fast and reliable delivery.",
  },
  {
    id: 3,
    question: "Can I track my shipment?",
    answer:
      "Yes! Once your order has been shipped, we’ll send you a tracking number via email so you can monitor your package's progress.",
  },
  {
    id: 4,
    question: "Do you offer international shipping?",
    answer:
      "Absolutely. We ship to over 100 countries worldwide. International shipping times and costs may vary depending on the destination.",
  },
  {
    id: 5,
    question: "What should I do if my package is lost or damaged?",
    answer:
      "If your package is lost or arrives damaged, please contact our support team immediately. We’ll work with the shipping carrier to resolve the issue and ensure you receive your order.",
  },
  {
    id: 6,
    question: "Are there any additional fees for international shipping?",
    answer:
      "Some countries may impose customs duties or taxes on your shipment. These fees are the responsibility of the recipient and vary by country. Please check with your local customs office for more information.",
  },
  {
    id: 7,
    question: "Can I change my shipping address after placing an order?",
    answer:
      "If your order hasn’t been shipped yet, you can update your shipping address by contacting our support team as soon as possible. Once the order is shipped, changes cannot be made.",
  },
  {
    id: 8,
    question: "Do you offer free shipping?",
    answer:
      "We offer free shipping on orders over a certain amount, depending on the destination. Check our website for the latest promotions and free shipping eligibility.",
  },
];

export default function Faq() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">
            Frequently Asked Questions
          </h2>
          <p className="mt-6 text-base leading-7 text-gray-600">
            Have a different question and can’t find the answer you’re looking
            for? Visit our{" "}
            <Link
              to="/contact"
              className="font-semibold text-primary hover:text-indigo-500"
            >
              contact page
            </Link>{" "}
            for further assistance, and we’ll help you as soon as possible.
          </p>
        </div>
        <div className="mt-20">
          <dl className="space-y-16 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-16 sm:space-y-0 lg:grid-cols-3 lg:gap-x-10">
            {faqs.map((faq) => (
              <div key={faq.id}>
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  {faq.question}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
