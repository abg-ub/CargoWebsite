import Table from "~/components/form/table";
import { TableItem } from "~/types";

export default function AdminDashboardPackage() {
  return (
    <Table
      title={"Packages"}
      description={"List of all packages"}
      buttonText={"Add Package"}
      onButtonClick={function (): void {
        throw new Error("Function not implemented.");
      }}
      data={[]}
      pageSize={0}
      onPageSizeChange={function (size: number): void {
        throw new Error("Function not implemented.");
      }}
      onSearch={function (query: string): void {
        throw new Error("Function not implemented.");
      }}
      onEdit={function (item: TableItem): void {
        throw new Error("Function not implemented.");
      }}
      onDelete={function (ids: (string | number)[]): void {
        throw new Error("Function not implemented.");
      }}
      currentPage={0}
      total={0}
      pageCount={0}
    />
  );
}
