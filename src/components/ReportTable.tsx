"use client";

import { components } from "@/clients/api/v1";
import { useMemo, useRef } from "react";
import ReportDetailModal from "./ReportDetailModal";
import { capitalize } from "@/utils/misc";

type Report = components["schemas"]["Report"];
interface ReportTableProps {
  reports: Report[];
}

function ReportTableRow({ report }: { report: Report }) {
  const reportDetailRef = useRef<HTMLDialogElement>(null);

  const reportType = useMemo(() => {
    return report.blogPostId ? "Blog Post" : "Comment";
  }, [report.blogPostId]);

  const formattedDate = new Date(report.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });


  return (
    <>
    <tr>
      <td>{report.id}</td>
      <td>{reportType}</td>
      <td className="text-ellipsis overflow-hidden">{capitalize(report.status)}</td>
      <td suppressHydrationWarning>{formattedDate}</td>
      <td>
        <button className="btn" onClick={() => reportDetailRef.current?.showModal()}>View</button>
      </td>
    </tr>

    <ReportDetailModal ref={reportDetailRef} report={report} onClose={() => reportDetailRef.current?.close()} />
    </>
  );
}

export default function ReportTable({ reports }: ReportTableProps) {
  return (
    <table className="table" suppressHydrationWarning>
      <thead>
        <tr>
          <th>ID</th>
          <th>Type</th>
          <th>Status</th>
          <th>Created At</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {reports.map((report) => (
          <ReportTableRow key={report.id} report={report} />
        ))}
      </tbody>
    </table>
  );
}
