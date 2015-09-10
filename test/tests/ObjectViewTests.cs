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

namespace NakedObjects.Web.UnitTests.Selenium {
    [TestClass]
    public abstract class ObjectViewTests : SpiroTest {
        [TestMethod]
        public virtual void FooterIcons() {
            br.Navigate().GoToUrl(Store555UrlWithActionsMenuOpen);
            wait.Until(d => d.FindElement(By.ClassName("object")));
            Assert.IsTrue(br.FindElement(By.ClassName("view")).Displayed);

            wait.Until(d => d.FindElement(By.ClassName("footer")));
            Assert.IsTrue(br.FindElement(By.ClassName("icon-home")).Displayed);
            Assert.IsTrue(br.FindElement(By.ClassName("icon-back")).Displayed);
            Assert.IsTrue(br.FindElement(By.ClassName("icon-forward")).Displayed);
            Assert.IsTrue(br.FindElement(By.ClassName("icon-edit")).Displayed);
        }

        [TestMethod]
        public virtual void Actions() {
            br.Navigate().GoToUrl(Store555UrlWithActionsMenuOpen);
            wait.Until(d => d.FindElement(By.ClassName("object")));
            Assert.IsTrue(br.FindElement(By.ClassName("view")).Displayed);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == StoreActions);
            ReadOnlyCollection<IWebElement> actions = br.FindElements(By.ClassName("action"));

            Assert.AreEqual("Create New Address", actions[0].Text);
            Assert.AreEqual("Create New Contact", actions[1].Text);
            Assert.AreEqual("Create New Order", actions[2].Text);
            Assert.AreEqual("Quick Order", actions[3].Text);
            Assert.AreEqual("Search For Orders", actions[4].Text);
            Assert.AreEqual("Last Order", actions[5].Text);
            Assert.AreEqual("Open Orders", actions[6].Text);
            Assert.AreEqual("Recent Orders", actions[7].Text);
        }

        [TestMethod]
        public virtual void PropertiesAndCollections() {
            br.Navigate().GoToUrl(Store555UrlWithActionsMenuOpen);
            wait.Until(d => d.FindElement(By.ClassName("object")));
            Assert.IsTrue(br.FindElement(By.ClassName("view")).Displayed);
            ReadOnlyCollection<IWebElement> properties = br.FindElements(By.ClassName("property"));

            Assert.AreEqual("Store Name:\r\nTwin Cycles", properties[0].Text);
            Assert.AreEqual("Demographics:\r\nAnnualSales: 800000 AnnualRevenue: 80000 BankName: International Security BusinessType: BM YearOpened: 1988 Specialty: Touring SquareFeet: 21000 Brands: AW Internet: T1 NumberEmployees: 11", properties[1].Text);
            Assert.AreEqual("Sales Person:\r\nLynn Tsoflias", properties[2].Text);
            Assert.AreEqual("Modified Date:\r\n13 Oct 2004 12:15:07", properties[3].Text);
            Assert.AreEqual("Account Number:\r\nAW00000555", properties[4].Text);
            Assert.AreEqual("Sales Territory:\r\nAustralia", properties[5].Text);

            ReadOnlyCollection<IWebElement> collections = br.FindElements(By.ClassName("collection"));

            Assert.AreEqual("Addresses:\r\n1-Customer Addresses", collections[0].Text);
            Assert.AreEqual("Contacts:\r\n1-Store Contacts", collections[1].Text);
        }

        [TestMethod]
        public virtual void ClickReferenceProperty() {
            br.Navigate().GoToUrl(Store555UrlWithActionsMenuOpen);

            wait.Until(d => d.FindElements(By.ClassName("property")).Count == StoreProperties);
            ReadOnlyCollection<IWebElement> references = br.FindElements(By.CssSelector("div.property .reference a"));

            Click(references[0]);

            wait.Until(d => d.FindElement(By.ClassName("object")));

            var title = br.FindElement(By.ClassName("title"));
            Assert.AreEqual("Lynn Tsoflias", title.Text);
        }

        [TestMethod]
        public virtual void ClickCollectionProperty() {
            br.Navigate().GoToUrl(Store555UrlWithActionsMenuOpen);

            wait.Until(d => d.FindElements(By.ClassName("collection")).Count == StoreCollections);
            ReadOnlyCollection<IWebElement> iconLists = br.FindElements(By.CssSelector("a.icon-list"));

            Click(iconLists[0]);

            wait.Until(d => d.FindElement(By.TagName("table")));

            // cancel table view 
            Click(br.FindElement(By.CssSelector("a.icon-summary")));

            WaitUntilGone(d => d.FindElement(By.ClassName("table")));
        }

        [TestMethod]
        public virtual void AttachmentProperty() {
            br.Navigate().GoToUrl(Product968Url);
            wait.Until(d => d.FindElements(By.ClassName("property")).Count == ProductProperties);
            wait.Until(d => d.FindElements(By.CssSelector("div.property  a > img")).Count == 1);
            Assert.IsTrue(br.FindElement(By.CssSelector("div.property  a > img")).GetAttribute("src").Length > 0); 
        }

        [TestMethod]
        public virtual void DialogAction() {
            br.Navigate().GoToUrl(Store555UrlWithActionsMenuOpen);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == StoreActions);
            ReadOnlyCollection<IWebElement> actions = br.FindElements(By.CssSelector(".action"));

            // click on action to open dialog 
            Click(actions[4]); // Search For Orders

            wait.Until(d => d.FindElement(By.ClassName("dialog")));
            string title = br.FindElement(By.CssSelector("div.dialog > div.title")).Text;

            Assert.AreEqual("Search For Orders", title);

            // cancel dialog 
            Click(br.FindElement(By.CssSelector("div.dialog  .cancel")));

            WaitUntilGone(d => d.FindElement(By.ClassName("dialog")));
        }

        [TestMethod]
        public virtual void DialogActionOk() {
            br.Navigate().GoToUrl(Store555UrlWithActionsMenuOpen);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == StoreActions);

            // click on action to open dialog 
            Click(br.FindElements(By.CssSelector(".action"))[4]); // Search for orders

            wait.Until(d => d.FindElement(By.ClassName("dialog")));
            string title = br.FindElement(By.CssSelector("div.dialog > div.title")).Text;

            Assert.AreEqual("Search For Orders", title);

            br.FindElements(By.CssSelector(".parameter .value input"))[0].SendKeys("1 Jan 2003");
            br.FindElements(By.CssSelector(".parameter .value input"))[1].SendKeys("1 Dec 2003" + Keys.Escape);

            Thread.Sleep(2000); // need to wait for datepicker :-(

            wait.Until(d => br.FindElement(By.ClassName("ok")));

            Click(br.FindElement(By.ClassName("ok")));

            wait.Until(d => d.FindElement(By.ClassName("query")));
        }

        [TestMethod]
        public virtual void ObjectAction() {
            br.Navigate().GoToUrl(Store555UrlWithActionsMenuOpen);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == StoreActions);

            IWebElement action = br.FindElements(By.CssSelector(".action"))[5];

            // click on action to get object 
            Click(action); // last order

            wait.Until(d => d.FindElement(By.ClassName("object")));
        }

        [TestMethod]
        public virtual void CollectionAction() {
            br.Navigate().GoToUrl(Store555UrlWithActionsMenuOpen);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == StoreActions);
            ReadOnlyCollection<IWebElement> actions = br.FindElements(By.CssSelector(".action"));

            // click on action to get collection 
            Click(actions[7]); // recent orders

            wait.Until(d => d.FindElement(By.ClassName("query")));
        }

        [TestMethod]
        public virtual void CollectionActionSelectItem() {
            br.Navigate().GoToUrl(Store555UrlWithActionsMenuOpen);

            var selectItem = new Action(() => {
                wait.Until(d => d.FindElements(By.ClassName("action")).Count == StoreActions);
                ReadOnlyCollection<IWebElement> actions = br.FindElements(By.CssSelector(".action"));

                // click on action to get object 
                Click(actions[7]); // recent orders

                wait.Until(d => d.FindElement(By.ClassName("query")));

                // select item
                Click(br.FindElement(By.CssSelector("table .reference")));

                wait.Until(d => br.FindElement(By.ClassName("object")));
            });
        }


        [TestMethod]
        public virtual void ObjectEdit() {
            br.Navigate().GoToUrl(Store555UrlWithActionsMenuOpen);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == StoreActions);

            wait.Until(d => d.FindElement(By.ClassName("icon-edit")).Displayed);

            Click(br.FindElement(By.ClassName("icon-edit")));

            wait.Until(d => br.FindElements(By.ClassName("action")).Count == 2);

            Assert.AreEqual("Save", br.FindElements(By.ClassName("action")).First().Text);
        }
    }

    #region browsers specific subclasses

    //[TestClass, Ignore]
    public class ObjectViewTestsIe : ObjectViewTests {
        [ClassInitialize]
        public new static void InitialiseClass(TestContext context) {
            FilePath(@"drivers.IEDriverServer.exe");
            SpiroTest.InitialiseClass(context);
        }

        [TestInitialize]
        public virtual void InitializeTest() {
            InitIeDriver();
            br.Navigate().GoToUrl(Url);
        }

        [TestCleanup]
        public virtual void CleanupTest() {
            base.CleanUpTest();
        }
    }

    [TestClass, Ignore]
    public class ObjectViewTestsFirefox : ObjectViewTests {
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

        protected override void ScrollTo(IWebElement element) {
            string script = string.Format("window.scrollTo({0}, {1});return true;", element.Location.X, element.Location.Y);
            ((IJavaScriptExecutor) br).ExecuteScript(script);
        }
    }

    //[TestClass, Ignore]
    public class ObjectViewTestsChrome : ObjectViewTests {
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
    }

    #endregion
}