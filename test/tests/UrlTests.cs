// Copyright Naked Objects Group Ltd, 45 Station Road, Henley on Thames, UK, RG9 1AT
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. 
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and limitations under the License.

using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium;
using System.Collections.ObjectModel;

namespace NakedObjects.Web.UnitTests.Selenium {

    /// <summary>
    /// Tests only that a given URLs return the correct views. No actions performed on them
    /// </summary>
    public abstract class UrlTests : SpiroTest
    {
        [TestMethod]
        public virtual void UnrecognisedUrlGoesToHome()
        {
            br.Navigate().GoToUrl(Url + "#/unrecognised");
            TestThatHomeElementsPresent();
            Assert.IsTrue(br.FindElements(By.ClassName("actions")).Count == 0);
        }

        #region Single pane Urls
        [TestMethod]
        public virtual void Home()
        {
            br.Navigate().GoToUrl(Url + "#/home");
            TestThatHomeElementsPresent();
            Assert.IsTrue(br.FindElements(By.ClassName("actions")).Count == 0);
        }

        protected void TestThatHomeElementsPresent()
        {
            wait.Until(d => d.FindElement(By.ClassName("single")));
            Assert.IsNotNull(br.FindElement(By.ClassName("home")));
            Assert.IsNotNull(br.FindElement(By.ClassName("header")));
            Assert.IsNotNull(br.FindElement(By.ClassName("menu")));
            Assert.IsNotNull(br.FindElement(By.ClassName("main-column")));

            ReadOnlyCollection<IWebElement> menus = br.FindElements(By.ClassName("menu"));
            Assert.AreEqual("Customers", menus[0].Text);
            Assert.AreEqual("Orders", menus[1].Text);
            Assert.AreEqual("Products", menus[2].Text);
            Assert.AreEqual("Employees", menus[3].Text);
            Assert.AreEqual("Sales", menus[4].Text);
            Assert.AreEqual("Special Offers", menus[5].Text);
            Assert.AreEqual("Contacts", menus[6].Text);
            Assert.AreEqual("Vendors", menus[7].Text);
            Assert.AreEqual("Purchase Orders", menus[8].Text);
            Assert.AreEqual("Work Orders", menus[9].Text);
            TestThatFooterElementsArePresent();
        }

        [TestMethod]
        public virtual void HomeWithMenu()
        {
            br.Navigate().GoToUrl(Url + "#/home?menu1=CustomerRepository");
            TestThatHomeElementsPresent();
            wait.Until(d => d.FindElement(By.ClassName("actions")));
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
        public virtual void HomeWithNoSuchMenu()
        {
            br.Navigate().GoToUrl(Url + "#/home?menu1=NoSuchRepository");
            wait.Until(d => d.FindElement(By.ClassName("error")));
            //TODO: Test for a clearer generic error message e.g. 'Invalid Url' or 'Invalid argument(s)'
        }

        [TestMethod]
        public virtual void HomeIgnoredInvalidParam()
        {
            br.Navigate().GoToUrl(Url + "#/home?menu2=Actions");
            TestThatHomeElementsPresent();
            Assert.IsTrue(br.FindElements(By.ClassName("actions")).Count == 0);
        }

        [TestMethod]
        public virtual void Object()
        {
            br.Navigate().GoToUrl(Url + "#/object?object1=AdventureWorksModel.Store-555");
            wait.Until(d => d.FindElement(By.ClassName("object")));
            wait.Until(d => d.FindElement(By.ClassName("view")));
            AssertObjectElementsPresent();
        }

        private void AssertObjectElementsPresent()
        {
            Assert.IsTrue(br.FindElements(By.ClassName("error")).Count == 0);
            Assert.IsNotNull(br.FindElement(By.ClassName("single")));
            Assert.IsNotNull(br.FindElement(By.ClassName("object")));
            Assert.IsNotNull(br.FindElement(By.ClassName("view")));
            Assert.IsNotNull(br.FindElement(By.ClassName("header")));
            var menu = br.FindElement(By.ClassName("menu"));
            Assert.AreEqual("Actions", menu.Text);
            Assert.IsNotNull(br.FindElement(By.ClassName("main-column")));
            Assert.IsNotNull(br.FindElement(By.ClassName("collections")));
        }

        [TestMethod, Ignore]
        public virtual void ObjectWithNoParams()
        {
            br.Navigate().GoToUrl(Url + "#/object");
            wait.Until(d => d.FindElement(By.ClassName("error")));
        }

        [TestMethod]
        public virtual void ObjectWithNoSuchObject()
        {
            br.Navigate().GoToUrl(Url + "#/object?object1=AdventureWorksModel.Foo-555");
            wait.Until(d => d.FindElement(By.ClassName("error")));
        }

        [TestMethod]
        public virtual void ObjectWithActions()
        {
            br.Navigate().GoToUrl(Url + "#/object?object1=AdventureWorksModel.Store-555&menu1=Actions");
            wait.Until(d => d.FindElement(By.ClassName("actions")));
            AssertObjectElementsPresent();
            GetObjectActions(StoreActions);
            GetObjectAction("Create New Address");
        }

        [TestMethod]
        public virtual void ObjectWithCollections()
        {
            br.Navigate().GoToUrl(Url + "#/object?object1=AdventureWorksModel.Store-555&&collection1_Addresses=List&collection1_Contacts=Table");
            wait.Until(d => d.FindElement(By.ClassName("collections")));
            AssertObjectElementsPresent();
            wait.Until(d => d.FindElements(By.ClassName("collection")).Count == 2);
            var collections = br.FindElements(By.ClassName("collection"));
            Assert.IsNotNull(collections[0].FindElement(By.TagName("table")));
            Assert.IsNotNull(collections[0].FindElement(By.ClassName("icon-table")));
            Assert.IsNotNull(collections[0].FindElement(By.ClassName("icon-summary")));
            Assert.IsTrue(collections[0].FindElements(By.ClassName("icon-list")).Count == 0);
        }

        [TestMethod, Ignore]
        public virtual void ObjectWithNoSuchCollection()
        {
            br.Navigate().GoToUrl(Url + "#/object?object1=AdventureWorksModel.Store-555&&collection1_NoSuch=List");
            wait.Until(d => d.FindElement(By.ClassName("error")));
        }

        [TestMethod, Ignore]
        public virtual void ObjectWithCollectionInvalidFormat()
        {
            br.Navigate().GoToUrl(Url + "#/object?object1=AdventureWorksModel.Store-555&&collection1_Addresses=Summary");
            wait.Until(d => d.FindElement(By.ClassName("error")));
        }
        //TODO: Edit mode


        [TestMethod, Ignore] //Error getting query (or doing refresh on a manually rectrieved query result)
        public virtual void QueryZeroParameterAction()
        {
            br.Navigate().GoToUrl(Url + "#/query?action1=HighestValueOrders");
            wait.Until(d => d.FindElement(By.ClassName("query")));
            TestThatQueryElementsArePresent();
        }
        #endregion

        #region Split pane Urls

        [TestMethod]
        public virtual void SplitHomeHome()
        {
            br.Navigate().GoToUrl(Url + "#/home/home");
            wait.Until(dr => dr.FindElement(By.CssSelector(".home")));
            var panes = br.FindElements(By.CssSelector(".split"));
            Assert.AreEqual(2, panes.Count);
            var left = panes[0].FindElement(By.ClassName("home"));
            Assert.AreEqual("Home", left.FindElement(By.CssSelector(".title")).Text);
            var right = panes[1].FindElement(By.ClassName("home"));
            Assert.AreEqual("Home", right.FindElement(By.CssSelector(".title")).Text);
        }

        [TestMethod]
        public virtual void SplitObjectHome()
        {
            br.Navigate().GoToUrl(Url + "#/object/home?object1=AdventureWorksModel.Store-555");
            wait.Until(dr => dr.FindElement(By.CssSelector(".object")));
            var panes = br.FindElements(By.CssSelector(".split"));
            Assert.AreEqual(2, panes.Count);
            var left = panes[0].FindElement(By.ClassName("object"));
            Assert.IsTrue(left.GetAttribute("class").Contains("object view"));
            Assert.AreEqual("Twin Cycles, AW00000555", panes[0].FindElement(By.CssSelector(".title")).Text);;
            var right = panes[1].FindElement(By.ClassName("home"));
            Assert.AreEqual("Home", right.FindElement(By.CssSelector(".title")).Text);
        }

        [TestMethod, Ignore] //Failing due to timing issues?
        public virtual void SplitQueryHome()
        {
            br.Navigate().GoToUrl(Url + "#/query/home?action1=HighestValueOrders");
            wait.Until(dr => dr.FindElement(By.CssSelector(".query .title")));
            var panes = br.FindElements(By.CssSelector(".split"));
            Assert.AreEqual(2, panes.Count);
            var left = panes[0].FindElement(By.ClassName("query"));
            Assert.AreEqual("Highest Value Orders", left.FindElement(By.CssSelector(".title")).Text);
            var right = panes[1].FindElement(By.ClassName("home"));
            Assert.AreEqual("Home", right.FindElement(By.CssSelector(".title")).Text);
        }
        #endregion

    }
    #region browsers specific subclasses 

   // [TestClass, Ignore]
    public class UrlTestsIe : UrlTests {
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
    public class UrlTestsFirefox : UrlTests {
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
    public class UrlTestsChrome : UrlTests {
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