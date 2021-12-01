using IdentityServer4.EntityFramework.Options;
using Microsoft.EntityFrameworkCore;
using WorldCities.Controllers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorldCities.Data;
using WorldCities.Data.Models;
using Xunit;
using Microsoft.Extensions.Options;

namespace WorldCities.Tests
{
    public class CitiesController_Test
    {
        ///<summary>
        ///Test the GetCity() method
        /// </summary>
        [Fact]
        public async void GetCity()
        {
            #region Arrange
            //todo: define the required assets
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "WorldCities")
                .Options;
            var storeOptions = Options.Create(new OperationalStoreOptions());

            using (var context = new ApplicationDbContext(options, storeOptions))
            {
                context.Add(new City()
                {
                    Id = 1,
                    CountryId = 1,
                    Lat = 1,
                    Lon = 1,
                    Name = "TestCity1"
                });
                context.SaveChanges();
            }

            City city_existing = null;
            City city_notExisting = null;
            #endregion
            #region Act
            //todo: invoke the test
            using (var context = new ApplicationDbContext(options, storeOptions))
            {
                var controller = new CitiesController(context);
                city_existing = (await controller.GetCity(1)).Value;
                city_notExisting = (await controller.GetCity(2)).Value;
            }
            #endregion
            #region Assert
            //todo: verify that conditions are met
            Assert.NotNull(city_existing);
            Assert.Null(city_notExisting);
            #endregion
        }
    }
}
