// Copyright Naked Objects Group Ltd, 45 Station Road, Henley on Thames, UK, RG9 1AT
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. 
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and limitations under the License.

using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace NakedObjects.Web.UnitTests.Selenium {
   /// <summary>
   /// Tests for the detailed operation of dialogs, including parameter rendering,
   /// choices, auto-complete, default values, formatting, and validation
   /// </summary>
    public abstract class DialogTests : SpiroTest {
        private const int CustomersFindCustomerByAccountNumber = 0;

        private const int OrdersOrdersByValue = 3;

        private const int StoresSearchForOrders = 4;

        private const int SalesListAccountsForSalesPerson = 2;

        private const int ProductsFindProductByName = 0;
        private const int ProductsFindProductByNumber = 1;
        private const int ProductsListProductsBySubcategory = 2;
        private const int ProductsListProductsBySubcategories = 3;
        private const int ProductsFindByProductLineAndClass = 4;
        private const int ProductsFindByProductLinesAndClasses = 5;
        private const int ProductsFindProduct = 6;
        private const int ProductsFindProductsByCategory = 7;

        [TestMethod]
        public virtual void ChoicesParm() {
            br.Navigate().GoToUrl(OrdersMenuUrl);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == OrderServiceActions);
            ReadOnlyCollection<IWebElement> actions = br.FindElements(By.ClassName("action"));

            var showList = new Action<string, string>((type, test) => {
                // click on action to open dialog 
                Click(br.FindElements(By.ClassName("action"))[OrdersOrdersByValue]); // orders by value

                wait.Until(d => d.FindElement(By.ClassName("dialog")));
                string title = br.FindElement(By.CssSelector("div.dialog > div.title")).Text;

                Assert.AreEqual("Orders By Value", title);

                br.FindElement(By.CssSelector(".value  select")).SendKeys(type);

                Click(br.FindElement(By.ClassName("ok")));

                wait.Until(d => d.FindElement(By.ClassName("query")));

                string topItem = br.FindElement(By.CssSelector("td.reference")).Text;

                Assert.AreEqual(test, topItem);
            });

            var cancelDialog = new Action(() => {
                Click(br.FindElement(By.CssSelector("div.dialog  .cancel")));

                wait.Until(d => {
                    try {
                        br.FindElement(By.ClassName("dialog"));
                        return false;
                    }
                    catch (NoSuchElementException) {
                        return true;
                    }
                });
            });

            showList("Ascending", "SO51782");
        }

        [TestMethod]
        public virtual void CancelDialog() {
            br.Navigate().GoToUrl(OrdersMenuUrl);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == OrderServiceActions);
            ReadOnlyCollection<IWebElement> actions = br.FindElements(By.ClassName("action"));

            var openDialog = new Action<string, string>((type, test) => {
                // click on action to open dialog 
                Click(br.FindElements(By.ClassName("action"))[OrdersOrdersByValue]); // orders by value

                wait.Until(d => d.FindElement(By.ClassName("dialog")));
                string title = br.FindElement(By.CssSelector("div.dialog > div.title")).Text;

                Assert.AreEqual("Orders By Value", title);
            });

            var cancelDialog = new Action(() => {
                Click(br.FindElement(By.CssSelector("div.dialog  .cancel")));

                wait.Until(d => {
                    try {
                        br.FindElement(By.ClassName("dialog"));
                        return false;
                    }
                    catch (NoSuchElementException) {
                        return true;
                    }
                });
            });

            openDialog("Ascending", "SO51782");
            cancelDialog();
        }

        [TestMethod]
        public virtual void ScalarChoicesParmKeepsValue() {
            br.Navigate().GoToUrl(OrdersMenuUrl);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == OrderServiceActions);

            // click on action to open dialog 
            Click(br.FindElements(By.ClassName("action"))[OrdersOrdersByValue]); // orders by value

            wait.Until(d => d.FindElement(By.ClassName("dialog")));
            string title = br.FindElement(By.CssSelector("div.dialog > div.title")).Text;

            Assert.AreEqual("Orders By Value", title);

            br.FindElement(By.CssSelector(".value  select")).SendKeys("Ascending");

            Click(br.FindElement(By.ClassName("ok")));

            wait.Until(d => d.FindElement(By.ClassName("query")));

            string topItem = br.FindElement(By.CssSelector(".reference")).Text;

            Assert.AreEqual("SO51782", topItem);
        }

        [TestMethod]
        public virtual void ScalarParmKeepsValue() {
            br.Navigate().GoToUrl(CustomersMenuUrl);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == CustomerServiceActions);

            // click on action to open dialog 
            Click(br.FindElements(By.ClassName("action"))[CustomersFindCustomerByAccountNumber]); // find customer by account number

            wait.Until(d => d.FindElement(By.ClassName("dialog")));
            string title = br.FindElement(By.CssSelector("div.dialog > div.title")).Text;

            Assert.AreEqual("Find Customer By Account Number", title);

            br.FindElement(By.CssSelector("div.value input")).SendKeys("00000042");

            Click(br.FindElement(By.ClassName("ok")));

            wait.Until(d => d.FindElement(By.ClassName("object")));
        }

        [TestMethod]
        public virtual void DateTimeParmKeepsValue() {
            br.Navigate().GoToUrl(Store555UrlWithActionsMenuOpen);

            wait.Until(d => d.FindElement(By.ClassName("object")));

            Click(GetObjectAction("Search For Orders")); 

            wait.Until(d => d.FindElement(By.ClassName("dialog")));
            string title = br.FindElement(By.CssSelector("div.dialog > div.title")).Text;

            Assert.AreEqual("Search For Orders", title);

            br.FindElements(By.CssSelector(".value input"))[0].SendKeys("1 Jan 2003");
            br.FindElements(By.CssSelector(".value input"))[1].SendKeys("1 Dec 2003" + Keys.Escape);

            Thread.Sleep(2000); // need to wait for datepicker :-(

            wait.Until(d => br.FindElement(By.ClassName("ok")));

            Click(br.FindElement(By.ClassName("ok")));

            wait.Until(d => d.FindElement(By.ClassName("query")));
        }

        [TestMethod]
        public virtual void RefChoicesParmKeepsValue() {
            br.Navigate().GoToUrl(ProductServiceUrl);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == ProductServiceActions);

            // click on action to open dialog 
            Click(br.FindElements(By.ClassName("action"))[ProductsListProductsBySubcategory]); // list products by sub cat

            wait.Until(d => d.FindElement(By.ClassName("dialog")));
            string title = br.FindElement(By.CssSelector("div.dialog > div.title")).Text;

            Assert.AreEqual("List Products By Sub Category", title);

            br.FindElement(By.CssSelector(".value  select")).SendKeys("Forks");

            Click(br.FindElement(By.ClassName("ok")));

            wait.Until(d => d.FindElement(By.ClassName("query")));

            string topItem = br.FindElement(By.CssSelector(".reference")).Text;

            Assert.AreEqual("HL Fork", topItem);
        }

        [TestMethod]
        public virtual void MultipleRefChoicesDefaults() {
            br.Navigate().GoToUrl(ProductServiceUrl);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == ProductServiceActions);

            // click on action to open dialog 
            Click(br.FindElements(By.ClassName("action"))[ProductsListProductsBySubcategories]); // list products by sub cat

            wait.Until(d => d.FindElement(By.ClassName("dialog")));
            string title = br.FindElement(By.CssSelector("div.dialog > div.title")).Text;

            Assert.AreEqual("List Products By Sub Categories", title);

            var selected = new SelectElement(br.FindElement(By.CssSelector("div#subcategories select")));

            Assert.AreEqual(2, selected.AllSelectedOptions.Count);
            Assert.AreEqual("Mountain Bikes", selected.AllSelectedOptions.First().Text);
            Assert.AreEqual("Touring Bikes", selected.AllSelectedOptions.Last().Text);

            Click(br.FindElement(By.ClassName("ok")));

            wait.Until(d => d.FindElement(By.ClassName("query")));

            string topItem = br.FindElement(By.CssSelector(".reference")).Text;

            Assert.AreEqual("Mountain-100 Black, 38", topItem);
        }

        [TestMethod]
        public virtual void MultipleRefChoicesChangeDefaults() {
            br.Navigate().GoToUrl(ProductServiceUrl);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == ProductServiceActions);

            // click on action to open dialog 
            Click(br.FindElements(By.ClassName("action"))[ProductsListProductsBySubcategories]); // list products by sub cat

            wait.Until(d => d.FindElement(By.ClassName("dialog")));
            string title = br.FindElement(By.CssSelector("div.dialog > div.title")).Text;

            Assert.AreEqual("List Products By Sub Categories", title);

            br.FindElement(By.CssSelector(".value  select")).SendKeys("Handlebars");
            IKeyboard kb = ((IHasInputDevices) br).Keyboard;

            kb.PressKey(Keys.Control);
            br.FindElement(By.CssSelector(".value  select option[label='Brakes']")).Click();
            kb.ReleaseKey(Keys.Control);

            Click(br.FindElement(By.ClassName("ok")));

            wait.Until(d => d.FindElement(By.ClassName("query")));

            string topItem = br.FindElement(By.CssSelector(".reference")).Text;

            Assert.AreEqual("Front Brakes", topItem);
        }

        [TestMethod]
        public virtual void ChoicesDefaults() {
            br.Navigate().GoToUrl(ProductServiceUrl);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == ProductServiceActions);

            // click on action to open dialog 
            Click(br.FindElements(By.ClassName("action"))[ProductsFindByProductLineAndClass]); // find by product line and class

            wait.Until(d => d.FindElement(By.ClassName("dialog")));
            string title = br.FindElement(By.CssSelector("div.dialog > div.title")).Text;

            Assert.AreEqual("Find By Product Line And Class", title);

            var slctPl = new SelectElement(br.FindElement(By.CssSelector("div#productline select")));
            var slctPc = new SelectElement(br.FindElement(By.CssSelector("div#productclass select")));

            Assert.AreEqual("M", slctPl.SelectedOption.Text);
            Assert.AreEqual("H", slctPc.SelectedOption.Text);

            Click(br.FindElement(By.ClassName("ok")));

            wait.Until(d => d.FindElement(By.ClassName("query")));

            string topItem = br.FindElement(By.CssSelector(".reference")).Text;

            Assert.AreEqual("Mountain-300 Black, 38", topItem);
        }

        [TestMethod]
        public virtual void ChoicesChangeDefaults() {
            br.Navigate().GoToUrl(ProductServiceUrl);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == ProductServiceActions);

            // click on action to open dialog 
            Click(br.FindElements(By.ClassName("action"))[ProductsFindByProductLineAndClass]); // find by product line and class

            wait.Until(d => d.FindElement(By.ClassName("dialog")));
            string title = br.FindElement(By.CssSelector("div.dialog > div.title")).Text;

            Assert.AreEqual("Find By Product Line And Class", title);

            br.FindElement(By.CssSelector("div#productline .value  select")).SendKeys("R");
            br.FindElement(By.CssSelector("div#productclass .value  select")).SendKeys("L");

            Click(br.FindElement(By.ClassName("ok")));

            wait.Until(d => d.FindElement(By.ClassName("query")));

            string topItem = br.FindElement(By.CssSelector(".reference")).Text;

            Assert.AreEqual("HL Road Frame - Black, 58", topItem);
        }

        [TestMethod]
        public virtual void ConditionalChoicesDefaults() {
            br.Navigate().GoToUrl(ProductServiceUrl);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == ProductServiceActions);

            // click on action to open dialog 
            Click(br.FindElements(By.ClassName("action"))[ProductsFindProductsByCategory]);

            wait.Until(d => d.FindElement(By.ClassName("dialog")));
            string title = br.FindElement(By.CssSelector("div.dialog > div.title")).Text;

            Assert.AreEqual("Find Products By Category", title);

            var slctCs = new SelectElement(br.FindElement(By.CssSelector("div#categories select")));

            Assert.AreEqual("Bikes", slctCs.SelectedOption.Text);

            var slct = new SelectElement(br.FindElement(By.CssSelector("div#subcategories select")));

            Assert.AreEqual(2, slct.AllSelectedOptions.Count);
            Assert.AreEqual("Mountain Bikes", slct.AllSelectedOptions.First().Text);
            Assert.AreEqual("Road Bikes", slct.AllSelectedOptions.Last().Text);

            Click(br.FindElement(By.ClassName("ok")));

            wait.Until(d => d.FindElement(By.ClassName("query")));

            string topItem = br.FindElement(By.CssSelector(".reference")).Text;

            Assert.AreEqual("Mountain-100 Black, 38", topItem);
        }

        [TestMethod]
        public virtual void ConditionalChoicesChangeDefaults() {
            br.Navigate().GoToUrl(ProductServiceUrl);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == ProductServiceActions);

            // click on action to open dialog 
            Click(br.FindElements(By.ClassName("action"))[ProductsFindProductsByCategory]);

            wait.Until(d => d.FindElement(By.ClassName("dialog")));
            string title = br.FindElement(By.CssSelector("div.dialog > div.title")).Text;

            Assert.AreEqual("Find Products By Category", title);

            var slctCs = new SelectElement(br.FindElement(By.CssSelector("div#categories select")));

            Assert.AreEqual("Bikes", slctCs.SelectedOption.Text);

            var slct = new SelectElement(br.FindElement(By.CssSelector("div#subcategories select")));

            Assert.AreEqual(2, slct.AllSelectedOptions.Count);
            Assert.AreEqual("Mountain Bikes", slct.AllSelectedOptions.First().Text);
            Assert.AreEqual("Road Bikes", slct.AllSelectedOptions.Last().Text);

            Click(br.FindElement(By.ClassName("ok")));

            wait.Until(d => d.FindElement(By.ClassName("query")));

            string topItem = br.FindElement(By.CssSelector(".reference")).Text;

            Assert.AreEqual("Mountain-100 Black, 38", topItem);
        }

        [TestMethod]
        public virtual void AutoCompleteParmShow() {
            br.Navigate().GoToUrl(SalesServiceUrl);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == SalesServiceActions);

            // click on action to open dialog 
            Click(br.FindElements(By.ClassName("action"))[SalesListAccountsForSalesPerson]); // list accounts for sales person 

            wait.Until(d => d.FindElement(By.ClassName("dialog")));
            string title = br.FindElement(By.CssSelector("div.dialog > div.title")).Text;

            Assert.AreEqual("List Accounts For Sales Person", title);

            br.FindElement(By.CssSelector(".value input[type='text']")).SendKeys("Valdez");

            wait.Until(d => d.FindElement(By.ClassName("ui-menu-item")));

            Click(br.FindElement(By.CssSelector(".ui-menu-item")));

            Click(br.FindElement(By.ClassName("ok")));

            wait.Until(d => d.FindElement(By.ClassName("query")));
        }

        [TestMethod]
        public virtual void AutoCompleteParmGo() {
            br.Navigate().GoToUrl(SalesServiceUrl);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == SalesServiceActions);

            // click on action to open dialog 
            Click(br.FindElements(By.ClassName("action"))[SalesListAccountsForSalesPerson]); // list accounts for sales person 

            wait.Until(d => d.FindElement(By.ClassName("dialog")));
            string title = br.FindElement(By.CssSelector("div.dialog > div.title")).Text;

            Assert.AreEqual("List Accounts For Sales Person", title);

            br.FindElement(By.CssSelector(".value input[type='text']")).SendKeys("Valdez");

            wait.Until(d => d.FindElements(By.CssSelector(".ui-menu-item")).Count > 0);

            Click(br.FindElement(By.CssSelector(".ui-menu-item")));

            Click(br.FindElement(By.ClassName("ok")));

            wait.Until(d => d.FindElement(By.ClassName("query")));

            try {
                br.FindElement(By.CssSelector(".value input[type='text']"));
                // found so it fails
                Assert.Fail();
            }
            catch {
                // all OK 
            }
        }

        [TestMethod]
        public virtual void AutoCompleteParmDefault() {
            br.Navigate().GoToUrl(ProductServiceUrl);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == ProductServiceActions);

            // click on action to open dialog 
            Click(br.FindElements(By.ClassName("action"))[ProductsFindProduct]); // list accounts for sales person 

            wait.Until(d => d.FindElement(By.ClassName("dialog")));
            string title = br.FindElement(By.CssSelector("div.dialog > div.title")).Text;

            Assert.AreEqual("Find Product", title);

            Assert.AreEqual("Adjustable Race", br.FindElement(By.CssSelector(".value input[type='text']")).GetAttribute("value"));

            Click(br.FindElement(By.ClassName("ok")));

            wait.Until(d => d.FindElement(By.ClassName("object")));

            Assert.AreEqual("Adjustable Race", br.FindElement(By.CssSelector(".title")).Text);
        }

        [TestMethod]
        public virtual void AutoCompleteParmShowSingleItem() {
            br.Navigate().GoToUrl(ProductServiceUrl);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == ProductServiceActions);

            // click on action to open dialog 
            Click(br.FindElements(By.ClassName("action"))[ProductsFindProduct]); // list accounts for sales person 

            wait.Until(d => d.FindElement(By.ClassName("dialog")));
            string title = br.FindElement(By.CssSelector("div.dialog > div.title")).Text;

            Assert.AreEqual("Find Product", title);

            var acElem = br.FindElement(By.CssSelector(".value input[type='text']"));

            for (int i = 0; i < 15; i++) {
                acElem.SendKeys(Keys.Backspace);
            }

            acElem.SendKeys("BB");

            wait.Until(d => d.FindElement(By.ClassName("ui-menu-item")));

            Click(br.FindElement(By.CssSelector(".ui-menu-item")));

            Click(br.FindElement(By.ClassName("ok")));

            wait.Until(d => d.FindElement(By.ClassName("object")));

            Assert.AreEqual("BB Ball Bearing", br.FindElement(By.CssSelector(".title")).Text);
        }
    }

    #region browsers specific subclasses

   // [TestClass, Ignore]
    public class DialogTestsIe : DialogTests {
        [ClassInitialize]
        public new static void InitialiseClass(TestContext context) {
            FilePath(@"drivers.IEDriverServer.exe");
            SpiroTest.InitialiseClass(context);
        }

        [TestInitialize]
        public virtual void InitializeTest() {
            InitIeDriver();
        }

        [TestCleanup]
        public virtual void CleanupTest() {
            base.CleanUpTest();
        }
    }

    [TestClass]
    public class DialogTestsFirefox : DialogTests {
        [ClassInitialize]
        public new static void InitialiseClass(TestContext context) {
            SpiroTest.InitialiseClass(context);
        }

        [TestInitialize]
        public virtual void InitializeTest() {
            InitFirefoxDriver();
        }

        [TestCleanup]
        public virtual void CleanupTest() {
            base.CleanUpTest();
        }
    }

   // [TestClass, Ignore]
    public class DialogTestsChrome : DialogTests {
        [ClassInitialize]
        public new static void InitialiseClass(TestContext context) {
            FilePath(@"drivers.chromedriver.exe");
            SpiroTest.InitialiseClass(context);
        }

        [TestInitialize]
        public virtual void InitializeTest() {
            InitChromeDriver();
        }

        [TestCleanup]
        public virtual void CleanupTest() {
            base.CleanUpTest();
        }

        protected override void ScrollTo(IWebElement element) {
            string script = string.Format("window.scrollTo({0}, {1});return true;", element.Location.X, element.Location.Y);
            ((IJavaScriptExecutor) br).ExecuteScript(script);
        }
    }

    #endregion
}