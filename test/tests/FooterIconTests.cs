// Copyright Naked Objects Group Ltd, 45 Station Road, Henley on Thames, UK, RG9 1AT
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. 
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and limitations under the License.

using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium;

namespace NakedObjects.Web.UnitTests.Selenium {
   // [TestClass]
    public abstract class FooterIconTests : SpiroTest {
        [TestMethod, Ignore]
        public virtual void FooterIcons() {
            wait.Until(d => d.FindElements(By.ClassName("footer")).Count == 1);

            Assert.IsTrue(br.FindElement(By.ClassName("icon-home")).Displayed);
            Assert.IsTrue(br.FindElement(By.ClassName("icon-back")).Displayed);
            Assert.IsTrue(br.FindElement(By.ClassName("icon-forward")).Displayed);
            //Assert.IsFalse(br.FindElement(By.ClassName("icon-refresh")).Displayed);
            Assert.IsFalse(br.FindElement(By.ClassName("icon-edit")).Displayed);
            //Assert.IsFalse(br.FindElement(By.ClassName("icon-help")).Displayed);
        }

        [TestMethod]
        public virtual void Home() {
            br.Navigate().GoToUrl(CustomerServiceUrl);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == CustomerServiceActions);
            Click(br.FindElement(By.ClassName("icon-home")));
            wait.Until(d => d.FindElements(By.ClassName("menu")).Count == MainMenusCount);
        }

        [TestMethod]
        public virtual void BackAndForward() {
            br.Navigate().GoToUrl(Url);
            wait.Until(d => d.FindElements(By.ClassName("menu")).Count == MainMenusCount);
            GoToMenuFromHomePage("Customers");
            wait.Until(d => d.FindElements(By.ClassName("action")).Count == CustomerServiceActions);
            Click(br.FindElement(By.ClassName("icon-back")));
            wait.Until(d => d.FindElements(By.ClassName("menu")).Count == MainMenusCount);
            Click(br.FindElement(By.ClassName("icon-forward")));
            wait.Until(d => d.FindElements(By.ClassName("action")).Count == CustomerServiceActions);
        }
    }

    #region browsers specific subclasses 

   // [TestClass, Ignore]
    public class MenuBarTestsIe : FooterIconTests {
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
    public class MenuBarTestsFirefox : FooterIconTests {
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
    public class MenuBarTestsChrome : FooterIconTests {
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
            string script = string.Format("window.scrollTo(0, {0})", element.Location.Y);
            ((IJavaScriptExecutor) br).ExecuteScript(script);
        }
    }

    #endregion
}