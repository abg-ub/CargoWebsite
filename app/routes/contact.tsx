import ContactForm from "~/components/form/contact-form";

export default function Contact() {
  return (
    <main className="pt-14">
      <div className="bg-white px-6 py-32 sm:py-48 lg:py-56 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Contact Our Shipping Support Center
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Have questions about our shipping services? Our dedicated team is
            here to assist you with all your logistics needs. Whether
            you&apos;re sending packages locally or internationally, we&apos;re
            committed to providing reliable and timely solutions.
          </p>
        </div>
      </div>
      <ContactForm />
    </main>
  );
}
