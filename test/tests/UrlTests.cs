// Copyright Naked Objects Group Ltd, 45 Station Road, Henley on Thames, UK, RG9 1AT
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. 
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and limitations under the License.

using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium;

namespace NakedObjects.Web.UnitTests.Selenium {
    /// <summary>
    /// Tests only that a given URLs return the correct views
    /// </summary>
    [TestClass]
    public abstract class UrlTests : SpiroTest {
        [TestMethod]
        public virtual void UnrecognisedUrlGoesToHome() {
            br.Navigate().GoToUrl(Url + "#/unrecognised");
            AssertHomeElementsPresent();
            Assert.IsTrue(br.FindElements(By.ClassName("actions")).Count == 0);
        }

        [TestMethod]
        public virtual void Home() {
            br.Navigate().GoToUrl(Url + "#/home");
            AssertHomeElementsPresent();
            Assert.IsTrue(br.FindElements(By.ClassName("actions")).Count == 0);
        }

        private void AssertHomeElementsPresent() {
            Assert.IsNotNull(br.FindElement(By.ClassName("single")));
            Assert.IsNotNull(br.FindElement(By.ClassName("home")));
            Assert.IsNotNull(br.FindElement(By.ClassName("header")));
            Assert.IsNotNull(br.FindElement(By.ClassName("menu")));
            Assert.IsNotNull(br.FindElement(By.ClassName("main-column")));
        }

        [TestMethod]
        public virtual void HomeWithMenu() {
            br.Navigate().GoToUrl(Url + "#/home?menu1=CustomerRepository");
            AssertHomeElementsPresent();
            Assert.IsNotNull(br.FindElement(By.ClassName("actions")));
            Assert.IsTrue(br.FindElements(By.ClassName("action"))[0].Text == "Find Customer By Account Number");
        }

        [TestMethod, Ignore] //Should give error page
        public virtual void HomeWithNoSuchMenu() {
            br.Navigate().GoToUrl(Url + "#/home?menu1=NoSuchRepository");
        }

        [TestMethod]
        public virtual void HomeIgnoredInvalidParam() {
            br.Navigate().GoToUrl(Url + "#/home?menu2=Actions");
            AssertHomeElementsPresent();
            Assert.IsTrue(br.FindElements(By.ClassName("actions")).Count == 0);
        }

        [TestMethod]
        public virtual void Object() {
            br.Navigate().GoToUrl(Url + "#/object?object1=AdventureWorksModel.Store-555");
            AssertObjectElementsPresent();
            Assert.IsTrue(br.FindElements(By.ClassName("actions")).Count == 0);
        }

        private void AssertObjectElementsPresent() {
            Assert.IsNotNull(br.FindElement(By.ClassName("single")));
            Assert.IsNotNull(br.FindElement(By.ClassName("object")));
            Assert.IsNotNull(br.FindElement(By.ClassName("view")));
            Assert.IsNotNull(br.FindElement(By.ClassName("header")));
            var menu = br.FindElement(By.ClassName("menu"));
            Assert.AreEqual("Actions", menu.Text);
            Assert.IsNotNull(br.FindElement(By.ClassName("main-column")));
            Assert.IsNotNull(br.FindElement(By.ClassName("collections")));
        }

        private const string ObjectWithNoSuchObject = Url + "#/object?object1=AdventureWorksModel.Foo-555";
        private const string ObjectIgnoresInvalidParam = Url + "#/object?object2=AdventureWorksModel.Store-555";
        private const string ObjectWithActions = Url + "#/object?object1=AdventureWorksModel.Store-555&menu1=Actions";
        private const string ObjectWithCollections = Url + "#/object?object1=AdventureWorksModel.Store-555&&collection1_Addresses=List&collection1_Contacts=Table";
        private const string ObjectWithNoSuchCollection = Url + "#/object?object1=AdventureWorksModel.Store-555&&collection1_NoSuch=List";
        private const string ObjectWithCollectionInvalidFormat = Url + "#/object?object1=AdventureWorksModel.Store-555&&collection1_Addresses=Summary";
        //TODO: Edit mode
        private const string UrlQuery = Url + "#/query";
    }

    #region browsers specific subclasses 

    [TestClass, Ignore]
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

    [TestClass, Ignore]
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