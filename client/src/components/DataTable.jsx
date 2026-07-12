import './DataTable.css';

export default function DataTable({ columns, data, pagination, onPageChange, actions, emptyMessage = 'No data available' }) {
  const { total = 0, page = 1, limit = 20, totalPages = 1 } = pagination || {};
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="data-table-container">
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} style={col.width ? { width: col.width } : {}}>{col.label}</th>
              ))}
              {actions && <th style={{ width: '100px' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="data-table-empty">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr key={row.id || rowIdx}>
                  {columns.map((col, colIdx) => (
                    <td key={colIdx}>{col.render ? col.render(row) : row[col.key]}</td>
                  ))}
                  {actions && <td className="data-table-actions">{actions(row)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && total > 0 && (
        <div className="data-table-pagination">
          <span className="data-table-showing">
            Showing {start} to {end} of {total}
          </span>
          <div className="data-table-page-controls">
            <button disabled={page <= 1} onClick={() => onPageChange?.(page - 1)} className="data-table-page-btn">Prev</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = i + 1;
              return (
                <button key={p} onClick={() => onPageChange?.(p)} className={`data-table-page-btn ${p === page ? 'data-table-page-btn--active' : ''}`}>
                  {p}
                </button>
              );
            })}
            <button disabled={page >= totalPages} onClick={() => onPageChange?.(page + 1)} className="data-table-page-btn">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
