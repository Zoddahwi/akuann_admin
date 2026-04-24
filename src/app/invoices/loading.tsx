export default function InvoicesLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10">
        <div className="h-8 bg-neutral-200 rounded animate-pulse w-48"></div>
        <div className="h-4 bg-neutral-200 rounded animate-pulse w-96 mt-2"></div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-[32px] border border-neutral-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-neutral-200 rounded-2xl animate-pulse"></div>
              <div className="flex-1">
                <div className="h-3 bg-neutral-200 rounded animate-pulse w-24 mb-2"></div>
                <div className="h-6 bg-neutral-200 rounded animate-pulse w-32"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-neutral-50/50 border-b border-neutral-100">
              <tr>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <th key={i} className="px-8 py-5">
                    <div className="h-3 bg-neutral-200 rounded animate-pulse w-16"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="group">
                  {[1, 2, 3, 4, 5, 6].map((j) => (
                    <td key={j} className="px-8 py-5">
                      <div className="h-4 bg-neutral-200 rounded animate-pulse w-20"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
