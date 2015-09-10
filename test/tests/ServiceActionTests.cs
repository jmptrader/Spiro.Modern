// Copyright Naked Objects Group Ltd, 45 Station Road, Henley on Thames, UK, RG9 1AT
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. 
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and limitations under the License.

using System;
using System.Collections.ObjectModel;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium;

namespace NakedObjects.Web.UnitTests.Selenium {

    /// <summary>
    /// Tests service actions (i.e. from main menus) including: 
    /// - Execution of zero-param actions
    /// - Rendering, cancelling, and happy-case execution of dialogs for actions with params
    /// - Does NOT test full functionality of dialogs (e.g. validation, choices) -  see DialogTests
    /// </summary>
    public abstract class ServiceActionTests : SpiroTest {

        //TODO:
        // disabled action
        // action throws exception

        [TestMethod]
        public virtual void ZeroParamReturnsObject()
        {
            br.Navigate().GoToUrl(CustomersMenuUrl);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == CustomerServiceActions);

            IWebElement action = br.FindElements(By.ClassName("action"))[3];
            Assert.AreEqual("Random Store", action.Text);

            // click on action to get object 
            Click(action);

            wait.Until(d => d.FindElement(By.ClassName("object")));
        }

        [TestMethod]
        public virtual void ZeroParamReturnsCollection()
        {
            br.Navigate().GoToUrl(OrderServiceUrl);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == OrderServiceActions);
            var action = br.FindElements(By.ClassName("action"))[2];

            Assert.AreEqual("Highest Value Orders", action.Text);
            Click(action);

            wait.Until(d => d.FindElement(By.ClassName("query")));
            wait.Until(d => d.FindElements(By.ClassName("reference")).Count == 20);
        }

        [TestMethod]
        public virtual void ZeroParamThrowsError()
        {
            br.Navigate().GoToUrl(CustomersMenuUrl);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == CustomerServiceActions);

            IWebElement action = br.FindElements(By.ClassName("action"))[8];
            Assert.AreEqual("Throw Domain Exception", action.Text);

            // click on action to get object 
            Click(action);

            wait.Until(d => d.FindElement(By.ClassName("error")));

            var msg = br.FindElement(By.CssSelector(".message"));
            Assert.AreEqual("Foo", msg.Text);
        }

        [TestMethod]
        public virtual void ZeroParamReturnsEmptyCollection()
        {
            br.Navigate().GoToUrl(OrderServiceUrl);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == OrderServiceActions);
            var actions = br.FindElements(By.ClassName("action"));

            Assert.AreEqual("Orders In Process", actions[0].Text);
            Click(actions[0]);

            wait.Until(d => d.FindElement(By.ClassName("query")));
            var rows = br.FindElements(By.CssSelector("td"));
            Assert.AreEqual(0, rows.Count);
        }

        [TestMethod]
        public virtual void SelectSuccessiveDialogActionsThenCancel() {
            br.Navigate().GoToUrl(CustomersMenuUrl);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == CustomerServiceActions);
            var actions = br.FindElements(By.ClassName("action"));
            Assert.AreEqual("Find Customer By Account Number", actions[0].Text);
            Click(actions[0]);

            wait.Until(d => d.FindElement(By.ClassName("dialog")));
            string title = br.FindElement(By.CssSelector("div.dialog > div.title")).Text;
            Assert.AreEqual("Find Customer By Account Number", title);

            actions = br.FindElements(By.ClassName("action"));
            Assert.AreEqual("Find Store By Name", actions[1].Text);
            Click(actions[1]);

            wait.Until(d => d.FindElement(By.CssSelector("div.dialog > div.title")).Text =="Find Store By Name");

            // cancel dialog 
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
        }

        [TestMethod]
        public virtual void DialogActionOK() {
            br.Navigate().GoToUrl(CustomersMenuUrl);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == CustomerServiceActions);

            // click on action to open dialog 
            Click(br.FindElements(By.ClassName("action"))[0]); // Find customer by account number

            wait.Until(d => d.FindElement(By.ClassName("dialog")));
            string title = br.FindElement(By.CssSelector("div.dialog > div.title")).Text;

            Assert.AreEqual("Find Customer By Account Number", title);

            br.FindElement(By.CssSelector(".value  input")).SendKeys("00022262");

            Click(br.FindElement(By.ClassName("ok")));

            wait.Until(d => d.FindElement(By.ClassName("object")));
        }

        [TestMethod]
        public virtual void CollectionActionSelectItem() {
            br.Navigate().GoToUrl(OrderServiceUrl);

            var selectItem = new Action(() => {
                wait.Until(d => d.FindElements(By.ClassName("action")).Count == OrderServiceActions);
                ReadOnlyCollection<IWebElement> actions = br.FindElements(By.ClassName("action"));

                // click on action to get object 
                Click(actions[2]); // highest value orders

                wait.Until(d => d.FindElement(By.ClassName("query")));

                // select item
                Click(br.FindElement(By.CssSelector("table .reference")));

                wait.Until(d => br.FindElement(By.ClassName("object")));
            });

            selectItem();
        }
    }

    #region browsers specific subclasses

    //[TestClass, Ignore]
    public class ServiceActionTestsIe : ServiceActionTests
    {
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
    public class ServiceActionTestsFirefox : ServiceActionTests
    {
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

    //[TestClass, Ignore]
    public class ServiceActionTestsChrome : ServiceActionTests {
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