import Pagination from "@/components/Pagination";
import ReportTable from "@/components/ReportTable";
import authorize_admin from "./actions";

export default async function Page({ searchParams }: { searchParams : { page?: string }}) {
  const page = searchParams.page ? parseInt(searchParams.page) : undefined;

  const response = await authorize_admin(page);

  if (!response.data) {
    return <div>Failed to fetch reports</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Reports</h1>
      <div className="mt-8">
        <ReportTable reports={response.data.data} />
      </div>

      <Pagination page={response.data._metadata!.page!} totalPage={response.data._metadata!.pageCount!} />
    </div>
  );
}
