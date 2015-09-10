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
    //TODO: These should be merged with Home page tests?
    //[TestClass]
    public abstract class MainMenuTests : SpiroTest {
        [TestMethod]
        public virtual void FooterIcons() {
            br.Navigate().GoToUrl(CustomerServiceUrl);
            wait.Until(d => d.FindElements(By.ClassName("footer")).Count == 1);
            Assert.IsTrue(br.FindElement(By.ClassName("icon-home")).Displayed);
            Assert.IsTrue(br.FindElement(By.ClassName("icon-back")).Displayed);
            Assert.IsTrue(br.FindElement(By.ClassName("icon-forward")).Displayed);
            //Assert.IsFalse(br.FindElement(By.ClassName("refresh")).Displayed);
            //Assert.IsFalse(br.FindElement(By.ClassName("help")).Displayed);
        }

        [TestMethod]
        public virtual void Actions() {
            br.Navigate().GoToUrl(CustomerServiceUrl);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == CustomerServiceActions);
            ReadOnlyCollection<IWebElement> actions = br.FindElements(By.ClassName("action"));

            Assert.AreEqual("Find Customer By Account Number", actions[0].Text);
            Assert.AreEqual("Find Store By Name", actions[1].Text);
            Assert.AreEqual("Create New Store Customer", actions[2].Text);
            Assert.AreEqual("Random Store", actions[3].Text);
            Assert.AreEqual("Find Individual Customer By Name", actions[4].Text);
            Assert.AreEqual("Create New Individual Customer", actions[5].Text);
            Assert.AreEqual("Random Individual", actions[6].Text);
            Assert.AreEqual("Customer Dashboard", actions[7].Text);
            Assert.AreEqual("Throw Domain Exception", actions[8].Text);
        }

        [TestMethod]
        public virtual void DialogActionCancel() {
            br.Navigate().GoToUrl(CustomerServiceUrl);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == CustomerServiceActions);
            ReadOnlyCollection<IWebElement> actions = br.FindElements(By.ClassName("action"));

            // click on action to open dialog 
            Click(actions[0]); // Find customer by account number

            wait.Until(d => d.FindElement(By.ClassName("dialog")));
            string title = br.FindElement(By.CssSelector("div.dialog > div.title")).Text;

            Assert.AreEqual("Find Customer By Account Number", title);

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
            br.Navigate().GoToUrl(CustomerServiceUrl);

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
        public virtual void ObjectAction() {
            br.Navigate().GoToUrl(CustomerServiceUrl);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == CustomerServiceActions);

            IWebElement action = br.FindElements(By.ClassName("action"))[3];

            // click on action to get object 
            Click(action); // random store 

            wait.Until(d => d.FindElement(By.ClassName("object")));
        }

        [TestMethod]
        public virtual void CollectionAction() {
            br.Navigate().GoToUrl(OrderServiceUrl);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == OrderServiceActions);
            ReadOnlyCollection<IWebElement> actions = br.FindElements(By.ClassName("action"));

            // click on action to get collection 
            Click(actions[2]); // highest value orders

            wait.Until(d => d.FindElement(By.ClassName("query")));
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
    public class MainMenuTestsIe : MainMenuTests {
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
    public class MainMenuTestsFirefox : MainMenuTests {
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
    public class MainMenuTestsChrome : MainMenuTests {
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