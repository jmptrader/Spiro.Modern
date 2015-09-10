// Copyright Naked Objects Group Ltd, 45 Station Road, Henley on Thames, UK, RG9 1AT
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. 
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and limitations under the License.

using System.Collections.ObjectModel;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium;

namespace NakedObjects.Web.UnitTests.Selenium {
    /// <summary>
    /// Tests content and navigation from Home representation
    /// </summary>
    public abstract class HomePageTests : SpiroTest {

        [TestMethod]
        public virtual void ClickOnVariousMenus() {
            GoToMenuFromHomePage("Customers");

            wait.Until(d => d.FindElement(By.ClassName("actions")));
            var actions = br.FindElements(By.ClassName("action"));
            Assert.AreEqual(9, actions.Count);

            Assert.AreEqual("Find Customer By Account Number", actions[0].Text);
            Assert.AreEqual("Find Store By Name", actions[1].Text);
            Assert.AreEqual("Create New Store Customer", actions[2].Text);
            Assert.AreEqual("Random Store", actions[3].Text);
            Assert.AreEqual("Find Individual Customer By Name", actions[4].Text);
            Assert.AreEqual("Create New Individual Customer", actions[5].Text);
            Assert.AreEqual("Random Individual", actions[6].Text);
            Assert.AreEqual("Customer Dashboard", actions[7].Text);
            Assert.AreEqual("Throw Domain Exception", actions[8].Text);

            GoToMenuFromHomePage("Sales");

            wait.Until(d => d.FindElement(By.ClassName("actions")));
            actions = br.FindElements(By.ClassName("action"));
            Assert.AreEqual(4, actions.Count);

            Assert.AreEqual("Create New Sales Person", actions[0].Text);
            Assert.AreEqual("Find Sales Person By Name", actions[1].Text);
            Assert.AreEqual("List Accounts For Sales Person", actions[2].Text);
            Assert.AreEqual("Random Sales Person", actions[3].Text);
        }
    }

    #region browsers specific subclasses 

//    [TestClass, Ignore]
    public class HomePageTestsIe : HomePageTests {
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

    [TestClass]
    public class HomePageTestsFirefox : HomePageTests {
        [ClassInitialize]
        public new static void InitialiseClass(TestContext context) {
            SpiroTest.InitialiseClass(context);
        }

        [TestInitialize]
        public virtual void InitializeTest() {
            InitFirefoxDriver();
            br.Navigate().GoToUrl(Url);
        }

        [TestCleanup]
        public virtual void CleanupTest() {
            base.CleanUpTest();
        }
    }

   // [TestClass, Ignore]
    public class HomePageTestsChrome : HomePageTests {
        [ClassInitialize]
        public new static void InitialiseClass(TestContext context) {
            FilePath(@"drivers.chromedriver.exe");
            SpiroTest.InitialiseClass(context);
        }

        [TestInitialize]
        public virtual void InitializeTest() {
            InitChromeDriver();
            br.Navigate().GoToUrl(Url);
        }

        [TestCleanup]
        public virtual void CleanupTest() {
            base.CleanUpTest();
        }

        protected override void ScrollTo(IWebElement element) {
            string script = string.Format("window.scrollTo(0, {0})", element.Location.Y);
            ((IJavaScriptExecutor) br).ExecuteScript(script);
        }
    }

    #endregion
}