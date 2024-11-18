export default function Heading2({
  onClick,
  title,
  buttonText,
}: {
  onClick: () => void;
  title: string;
  buttonText: string;
}) {
  return (
    <div className="border-b border-gray-200 pb-5 flex items-center justify-between">
      <h3 className="text-base font-semibold leading-6 text-gray-900">
        {title}
      </h3>
      <div className="mt-3 sm:ml-4 sm:mt-0">
        <button
          onClick={onClick}
          type="button"
          className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
