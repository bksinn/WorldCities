using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WorldCities.Controllers
{
    public class EmailTestController : Controller
    {
        private readonly IEmailSender _emailSender;
        public EmailTestController(IEmailSender emailSender)
        {
            _emailSender = emailSender;
        }

        public async Task<string> Index()
        {
            await _emailSender.SendEmailAsync("lissette.imagen@gmail.com", "Bambi", "is bad.");
            return "Email sent";
        }
    }
}
