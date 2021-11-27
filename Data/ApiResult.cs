﻿using Microsoft.EntityFrameworkCore;
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
        private ApiResult(
            List<T> data, 
            int count, 
            int pageIndex, 
            int pageSize, 
            string sortColumn, 
            string sortOrder,
            string filterColumn,
            string filterQuery)
        {
            Data = data;
            PageIndex = pageIndex;
            PageSize = pageSize;
            TotalCount = count;
            TotalPages = (int)Math.Ceiling(count / (double)pageSize);
            SortColumn = sortColumn;
            SortOrder = sortOrder;
            FilterColumn = filterColumn;
            FilterQuery = filterQuery;
        }

        #region Methods
        ///<summary>
        ///Pages, sorts and/or filters a IQueryable source.
        /// </summary>
        /// <param name="source">An IQueryable source of generic type</param>
        /// <param name="pageIndex">Zero-based current page index (0 = first page)</param>
        /// <param name="pageSize">Actual size of each page</param>
        /// <param name="sortColumn">The sorting column name</param>
        /// <param name="sortOrder">The sorting column order ("ASC" or "DESC")</param>
        /// <param name="filterColumn">Filtering column name</param>
        /// <param name="filterQuery">The filtering query (value to look up)</param>
        /// <returns>
        /// An object containing the Iqueryable paged/sorted/filtered result and all relevant paging/sorted/filtered navigation info
        /// </returns>
        public static async Task<ApiResult<T>> CreateAsync(
            IQueryable<T> source,
            int pageIndex,
            int pageSize,
            string sortColumn = null,
            string sortOrder = null,
            string filterColumn = null,
            string filterQuery = null)
        {
            if (!string.IsNullOrEmpty(filterColumn)
                && !string.IsNullOrEmpty(filterQuery)
                && IsValidProperty(filterColumn))
            {
                source = source.Where(
                    string.Format("{0}.Contains(@0)",
                    filterColumn),
                    filterQuery);
            }

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

            //retrieve the SQL query (for debug purposes)
#if DEBUG 
            {
                var sql = source.ToParametrizedSql();
                //do something with the sql string
            }
#endif

            var data = await source.ToListAsync();

            return new ApiResult<T>(
                data,
                count,
                pageIndex,
                pageSize,
                sortColumn,
                sortOrder,
                filterColumn,
                filterQuery
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
        ///<summary>
        ///Filter Column name (or null if none set)
        ///</summary>
        public string FilterColumn { get; set; }
        ///<summary>
        ///Filter Query string (to be used within the given FilterColumn
        /// </summary>
        public string FilterQuery { get; set; }

        #endregion
    }
}
