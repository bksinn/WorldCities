using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Linq.Dynamic.Core;
using System.Reflection;

namespace WorldCities.Data
{
    public class ApiResult<T>
    {
        ///<summary>
        ///Private constructor called by the CreateAsync method
        /// </summary>
        private ApiResult(List<T> data, int count, int pageIndex, int pageSize, string sortColumn, string sortOrder)
        {
            Data = data;
            PageIndex = pageIndex;
            PageSize = pageSize;
            TotalCount = count;
            TotalPages = (int)Math.Ceiling(count / (double)pageSize);
            SortColumn = sortColumn;
            SortOrder = sortOrder;
        }

        #region Methods
        ///<summary>
        ///Pages and/or sorts a Iqueryable source.
        /// </summary>
        /// <param name="source">An IQueryable source of generic type</param>
        /// <param name="pageIndex">Zero-based current page index (0 = first page)</param>
        /// <param name="pageSize">Actual size of each page</param>
        /// <param name="sortColumn">The sorting column name</param>
        /// <param name="sortOrder">The sorting column order ("ASC" or "DESC")</param>
        /// <returns>
        /// An object containing the paged/sorted result and all relevant paging/sorted navigation info
        /// </returns>
        public static async Task<ApiResult<T>> CreateAsync(IQueryable<T> source, int pageIndex, int pageSize, string sortColumn = null, string sortOrder = null)
        {
            var count = await source.CountAsync();
            if (!string.IsNullOrEmpty(sortColumn) && IsValidProperty(sortColumn))
            {
                sortOrder = !string.IsNullOrEmpty(sortOrder) && sortOrder.ToUpper() == "ASC" ? "ASC" : "DESC";

                source = source.OrderBy(
                    string.Format("{0} {1}", sortColumn, sortOrder)
                );
            };

            source = source
                .Skip(pageIndex * pageSize)
                .Take(pageSize);

            var data = await source.ToListAsync();

            return new ApiResult<T>(
                data,
                count,
                pageIndex,
                pageSize,
                sortColumn,
                sortOrder
            );
        }

        ///<summary>
        ///Checks if given property name exists to protect against SQL injection attacks
        /// </summary>
        public static bool IsValidProperty(string propertyName, bool throwExceptionIfNotFound = true)
        {
            var prop = typeof(T).GetProperty(
                propertyName,
                BindingFlags.IgnoreCase |
                BindingFlags.Public |
                BindingFlags.Instance
            );

            if (prop == null && throwExceptionIfNotFound)
                throw new NotSupportedException(string.Format("ERROR: Property '{0}' does not exist."));

            return prop != null;
        }
        #endregion
        #region Properties
        /// <summary>
        /// IQueryable data result to return.
        /// </summary>
        public List<T> Data { get; private set; }

        /// <summary>
        /// Zero-based index of current page.
        /// </summary>
        public int PageIndex { get; private set; }

        /// <summary>
        /// Number of items contained in each page.
        /// </summary>
        public int PageSize { get; private set; }

        /// <summary>
        /// Total items count
        /// </summary>
        public int TotalCount { get; private set; }

        /// <summary>
        /// Total pages count
        /// </summary>
        public int TotalPages { get; private set; }

        /// <summary>
        /// TRUE if the current page has a previous page, FALSE otherwise.
        /// </summary>
        public bool HasPreviousPage
        {
            get
            {
                return (PageIndex > 0);
            }
        }
        ///<summary>
        ///True if the current page has a next page, FALSE otherwise
        ///</summary>
        public bool HasNextPage
        {
            get
            {
                return ((PageIndex + 1) < TotalPages);
            }
        }
        ///<summary>
        ///Sorting Column name (or null if not set)
        ///</summary>
        public string SortColumn { get; set; }
        ///<summary>
        ///Sorting Order "ASC" or "DESC" (or null if not set)
        ///</summary>
        public string SortOrder { get; set; }
        #endregion
    }
}
