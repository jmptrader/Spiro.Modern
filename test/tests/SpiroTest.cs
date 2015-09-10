// Copyright Naked Objects Group Ltd, 45 Station Road, Henley on Thames, UK, RG9 1AT
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. 
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and limitations under the License.

using System;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium.IE;
using OpenQA.Selenium.Support.UI;

namespace NakedObjects.Web.UnitTests.Selenium {
    public class SafeWebDriverWait : IWait<IWebDriver> {
        private readonly WebDriverWait wait;

        public SafeWebDriverWait(IWebDriver driver, TimeSpan timeout) {
            wait = new WebDriverWait(driver, timeout);
        }

        public void IgnoreExceptionTypes(params Type[] exceptionTypes) {
            wait.IgnoreExceptionTypes(exceptionTypes);
        }

        public TResult Until<TResult>(Func<IWebDriver, TResult> condition) {
            return wait.Until(d => {
                try {
                    return condition(d);
                }
                catch (NoSuchElementException) {}
                return default(TResult);
            });
        }

        public TimeSpan Timeout
        {
            get { return wait.Timeout; }
            set { wait.Timeout = value; }
        }

        public TimeSpan PollingInterval
        {
            get { return wait.PollingInterval; }
            set { wait.PollingInterval = value; }
        }

        public string Message
        {
            get { return wait.Message; }
            set { wait.Message = value; }
        }
    }

    [TestClass]
    public abstract class SpiroTest {
        #region overhead

        protected const string Url = "http://localhost:49998/index.html";

        protected const string Server = @"Saturn\SqlExpress";
        protected const string Database = "AdventureWorks";
        protected const string Backup = "AdventureWorks";

        protected const string CustomerServiceUrl = Url + "#/home?menu1=CustomerRepository";
        protected const string OrderServiceUrl = Url + "#/home?menu1=OrderRepository";
        protected const string ProductServiceUrl = Url + "#/home?menu1=ProductRepository";
        protected const string SalesServiceUrl = Url + "#/home?menu1=SalesRepository";

        protected const int MainMenusCount = 11; //TODO: Should be 10 as Empty menu should not show

        protected const int CustomerServiceActions = 9;
        protected const int OrderServiceActions = 6;
        protected const int ProductServiceActions = 12;
        protected const int SalesServiceActions = 4;

        protected const string Store555UrlWithActionsMenuOpen = Url + "#/object?object1=AdventureWorksModel.Store-555&menu1=Actions";
        protected const string Product968Url = Url + "#/object?object1=AdventureWorksModel.Product-968";
        protected const string Product469Url = Url + "#/object?object1=AdventureWorksModel.Product-469";
        protected const string Product870Url = Url + "#/object?object1=AdventureWorksModel.Product-870";

        protected const int StoreActions = 8;
        protected const int StoreProperties = 6;
        protected const int StoreCollections = 2;
        protected const int ProductActions = 6;
        protected const int ProductProperties = 23;

        //protected const string url = "http://localhost:53103/";
        //protected const string server = @".\SQLEXPRESS";
        //protected const string database = "AdventureWorks";
        //protected const string backup = "AdventureWorksInitialState";

        protected IWebDriver br;
        protected SafeWebDriverWait wait;

        protected const int TimeOut = 20;

        [ClassInitialize]
        public static void InitialiseClass(TestContext context) {
            //DatabaseUtils.RestoreDatabase(Database, Backup, Server);
        }

        public virtual void CleanUpTest() {
            if (br != null) {
                try {
                    br.Manage().Cookies.DeleteAllCookies();
                    br.Quit();
                    br.Dispose();
                    br = null;
                }
                catch {
                    // to suppress error 
                }
            }
        }

        protected void InitFirefoxDriver() {
            br = new FirefoxDriver();
            wait = new SafeWebDriverWait(br, TimeSpan.FromSeconds(TimeOut));
            br.Manage().Window.Maximize();
        }

        protected void InitIeDriver() {
            br = new InternetExplorerDriver();
            wait = new SafeWebDriverWait(br, TimeSpan.FromSeconds(TimeOut));
            br.Manage().Window.Maximize();
        }

        protected void InitChromeDriver() {
            const string cacheDir = @"C:\SeleniumTestFolder";

            var crOptions = new ChromeOptions();
            crOptions.AddArgument(@"--user-data-dir=" + cacheDir);
            br = new ChromeDriver(crOptions);
            wait = new SafeWebDriverWait(br, TimeSpan.FromSeconds(TimeOut));
            br.Manage().Window.Maximize();

            // test workaround for chromedriver problem https://groups.google.com/forum/#!topic/selenium-users/nJ0NF1UJ3WU
            Thread.Sleep(5000);
        }

        #endregion

        #region Helpers

        protected void WaitUntilGone<TResult>(Func<IWebDriver, TResult> condition) {
            wait.Until(d => {
                try {
                    condition(d);
                    return false;
                }
                catch (NoSuchElementException) {
                    return true;
                }
            });
        }

        protected virtual void Maximize() {
            const string script = "window.moveTo(0, 0); window.resizeTo(screen.availWidth, screen.availHeight);";
            ((IJavaScriptExecutor) br).ExecuteScript(script);
        }

        protected virtual void ScrollTo(IWebElement element) {
            string script = string.Format("window.scrollTo({0}, {1});return true;", element.Location.X, element.Location.Y);
            ((IJavaScriptExecutor) br).ExecuteScript(script);
        }

        protected virtual void Click(IWebElement element) {
            ScrollTo(element);
            element.Click();
        }

        protected virtual void GoToMenuFromHomePage(string menuName) {
            wait.Until(d => d.FindElements(By.ClassName("menu")).Count == MainMenusCount);
            ReadOnlyCollection<IWebElement> services = br.FindElements(By.CssSelector("div.menu"));
            IWebElement menu = services.FirstOrDefault(s => s.Text == menuName);
            if (menu != null) {
                Click(menu);
                wait.Until(d => d.FindElements(By.CssSelector(".actions .action")).Count > 0);
            }
            else {
                throw new NotFoundException(string.Format("menu not found {0}", menuName));
            }
        }

        protected void Login() {
            Thread.Sleep(2000);
        }

        #endregion

        #region chrome helper

        protected static string FilePath(string resourcename) {
            string fileName = resourcename.Remove(0, resourcename.IndexOf(".") + 1);

            string newFile = Path.Combine(Directory.GetCurrentDirectory(), fileName);

            if (File.Exists(newFile)) {
                File.Delete(newFile);
            }

            Assembly assembly = Assembly.GetExecutingAssembly();

            using (Stream stream = assembly.GetManifestResourceStream("Spiro.Angular.Selenium.Test." + resourcename)) {
                using (FileStream fileStream = File.Create(newFile, (int) stream.Length)) {
                    var bytesInStream = new byte[stream.Length];
                    stream.Read(bytesInStream, 0, bytesInStream.Length);
                    fileStream.Write(bytesInStream, 0, bytesInStream.Length);
                }
            }

            return newFile;
        }

        #endregion
    }
}