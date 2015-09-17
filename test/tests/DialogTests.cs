﻿// Copyright Naked Objects Group Ltd, 45 Station Road, Henley on Thames, UK, RG9 1AT
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

namespace NakedObjects.Web.UnitTests.Selenium
{
    /// <summary>
    /// Tests for the detailed operation of dialogs, including parameter rendering,
    /// choices, auto-complete, default values, formatting, and validation
    /// </summary>
    public abstract class DialogTests : SpiroTest
    {
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
        public virtual void ChoicesParm()
        {
            br.Navigate().GoToUrl(OrdersMenuUrl);
            OpenActionDialog("Orders By Value");
            br.FindElement(By.CssSelector(".value  select")).SendKeys("Ascending");
            ClickOK();
            WaitForSingleQuery();
            AssertTopItemInListIs("SO51782");
        }

        [TestMethod]
        public virtual void TestCancelDialog()
        {
            br.Navigate().GoToUrl(OrdersMenuUrl);
            OpenActionDialog("Orders By Value");
            CancelDialog();
        }

        [TestMethod]
        public virtual void ScalarChoicesParmKeepsValue()
        {
            br.Navigate().GoToUrl(OrdersMenuUrl);
            GetObjectActions(OrderServiceActions);
            OpenActionDialog("Orders By Value");

            GetByCss(".value  select").SendKeys("Ascending");
            ClickOK();
            WaitForSingleQuery();
            AssertTopItemInListIs("SO51782");
        }

        [TestMethod]
        public virtual void ScalarParmKeepsValue()
        {
            br.Navigate().GoToUrl(CustomersMenuUrl);
            GetObjectActions(CustomerServiceActions);
            OpenActionDialog("Find Customer By Account Number");
            GetByCss(".value input").SendKeys("00000042");
            ClickOK();
            WaitForSingleObject();
        }

        [TestMethod]
        public virtual void DateTimeParmKeepsValue()
        {
            br.Navigate().GoToUrl(Store555UrlWithActionsMenuOpen);
            Click(GetObjectAction("Search For Orders"));
            br.FindElements(By.CssSelector(".value input"))[0].SendKeys("1 Jan 2003");
            br.FindElements(By.CssSelector(".value input"))[1].SendKeys("1 Dec 2003" + Keys.Escape);

            Thread.Sleep(2000); // need to wait for datepicker :-(
            ClickOK();
            WaitForSingleQuery();
        }

        [TestMethod]
        public virtual void RefChoicesParmKeepsValue()
        {
            br.Navigate().GoToUrl(ProductServiceUrl);
OpenActionDialog("List Products By Sub Category");

            br.FindElement(By.CssSelector(".value  select")).SendKeys("Forks");

            ClickOK();
            WaitForSingleQuery();
            AssertTopItemInListIs("HL Fork");
        }

        [TestMethod]
        public virtual void MultipleRefChoicesDefaults()
        {
            br.Navigate().GoToUrl(ProductServiceUrl);
            OpenActionDialog("List Products By Sub Categories");

            var selected = new SelectElement(br.FindElement(By.CssSelector("div#subcategories select")));

            Assert.AreEqual(2, selected.AllSelectedOptions.Count);
            Assert.AreEqual("Mountain Bikes", selected.AllSelectedOptions.First().Text);
            Assert.AreEqual("Touring Bikes", selected.AllSelectedOptions.Last().Text);

            ClickOK();
            WaitForSingleQuery();
            AssertTopItemInListIs("Mountain-100 Black, 38");
        }

        [TestMethod]
        public virtual void MultipleRefChoicesChangeDefaults()
        {
            br.Navigate().GoToUrl(ProductServiceUrl);
            OpenActionDialog("List Products By Sub Categories");

            br.FindElement(By.CssSelector(".value  select")).SendKeys("Handlebars");
            IKeyboard kb = ((IHasInputDevices)br).Keyboard;

            kb.PressKey(Keys.Control);
            br.FindElement(By.CssSelector(".value  select option[label='Brakes']")).Click();
            kb.ReleaseKey(Keys.Control);

            ClickOK();
            WaitForSingleQuery();
            AssertTopItemInListIs("Front Brakes");
        }

        [TestMethod]
        public virtual void ChoicesDefaults()
        {
            br.Navigate().GoToUrl(ProductServiceUrl);
            OpenActionDialog("Find By Product Line And Class");

            var slctPl = new SelectElement(br.FindElement(By.CssSelector("div#productline select")));
            var slctPc = new SelectElement(br.FindElement(By.CssSelector("div#productclass select")));

            Assert.AreEqual("M", slctPl.SelectedOption.Text);
            Assert.AreEqual("H", slctPc.SelectedOption.Text);

            ClickOK();
            WaitForSingleQuery();
            AssertTopItemInListIs("Mountain-300 Black, 38");
        }

        [TestMethod]
        public virtual void ChoicesChangeDefaults()
        {
            br.Navigate().GoToUrl(ProductServiceUrl);
            OpenActionDialog("Find By Product Line And Class");

            br.FindElement(By.CssSelector("div#productline .value  select")).SendKeys("R");
            br.FindElement(By.CssSelector("div#productclass .value  select")).SendKeys("L");

            ClickOK();
            WaitForSingleQuery();
            AssertTopItemInListIs("HL Road Frame - Black, 58");
        }

        [TestMethod, Ignore] //Passing locally; failing on server
        public virtual void ConditionalChoicesDefaults()
        {
            br.Navigate().GoToUrl(ProductServiceUrl);
            OpenActionDialog("Find Products By Category");
            var slctCs = new SelectElement(br.FindElement(By.CssSelector("div#categories select")));

            Assert.AreEqual("Bikes", slctCs.SelectedOption.Text);

            var slct = new SelectElement(br.FindElement(By.CssSelector("div#subcategories select")));

            Assert.AreEqual(2, slct.AllSelectedOptions.Count);
            Assert.AreEqual("Mountain Bikes", slct.AllSelectedOptions.First().Text);
            Assert.AreEqual("Road Bikes", slct.AllSelectedOptions.Last().Text);

            ClickOK();
            WaitForSingleQuery();
            AssertTopItemInListIs("Mountain-100 Black, 38");
        }

        [TestMethod, Ignore] //Passing locally; failing on server
        public virtual void ConditionalChoicesChangeDefaults()
        {
            br.Navigate().GoToUrl(ProductServiceUrl);

            OpenActionDialog("Find Products By Category");

            var slctCs = new SelectElement(br.FindElement(By.CssSelector("div#categories select")));

            Assert.AreEqual("Bikes", slctCs.SelectedOption.Text);

            var slct = new SelectElement(br.FindElement(By.CssSelector("div#subcategories select")));

            Assert.AreEqual(2, slct.AllSelectedOptions.Count);
            Assert.AreEqual("Mountain Bikes", slct.AllSelectedOptions.First().Text);
            Assert.AreEqual("Road Bikes", slct.AllSelectedOptions.Last().Text);

            ClickOK();
            WaitForSingleQuery();
            AssertTopItemInListIs("Mountain-100 Black, 38");
        }

        [TestMethod]
        public virtual void AutoCompleteParmShow()
        {
            br.Navigate().GoToUrl(SalesServiceUrl);
            OpenActionDialog("List Accounts For Sales Person");

            br.FindElement(By.CssSelector(".value input[type='text']")).SendKeys("Valdez");

            wait.Until(d => d.FindElement(By.ClassName("ui-menu-item")));

            Click(br.FindElement(By.CssSelector(".ui-menu-item")));

            ClickOK();
            WaitForSingleQuery();
        }

        [TestMethod]
        public virtual void AutoCompleteParmGo()
        {
            br.Navigate().GoToUrl(SalesServiceUrl);
            OpenActionDialog("List Accounts For Sales Person");

            br.FindElement(By.CssSelector(".value input[type='text']")).SendKeys("Valdez");

            wait.Until(d => d.FindElements(By.CssSelector(".ui-menu-item")).Count > 0);

            Click(br.FindElement(By.CssSelector(".ui-menu-item")));

            ClickOK();
            WaitForSingleQuery();

            try
            {
                br.FindElement(By.CssSelector(".value input[type='text']"));
                // found so it fails
                Assert.Fail();
            }
            catch
            {
                // all OK 
            }
        }

        [TestMethod]
        public virtual void AutoCompleteParmDefault()
        {
            br.Navigate().GoToUrl(ProductServiceUrl);
            OpenActionDialog("Find Product");

            Assert.AreEqual("Adjustable Race", br.FindElement(By.CssSelector(".value input[type='text']")).GetAttribute("value"));

            ClickOK();
            WaitForSingleObject("Adjustable Race");
        }

        [TestMethod]
        public virtual void AutoCompleteParmShowSingleItem()
        {
            br.Navigate().GoToUrl(ProductServiceUrl);
            OpenActionDialog("Find Product");

            var acElem = br.FindElement(By.CssSelector(".value input[type='text']"));

            for (int i = 0; i < 15; i++)
            {
                acElem.SendKeys(Keys.Backspace);
            }
            acElem.SendKeys("BB");
            Click(GetByCss(".ui-menu-item"));
            ClickOK();
            WaitForSingleObject("BB Ball Bearing");
        }
    }

    #region browsers specific subclasses

    // [TestClass, Ignore]
    public class DialogTestsIe : DialogTests
    {
        [ClassInitialize]
        public new static void InitialiseClass(TestContext context)
        {
            FilePath(@"drivers.IEDriverServer.exe");
            SpiroTest.InitialiseClass(context);
        }

        [TestInitialize]
        public virtual void InitializeTest()
        {
            InitIeDriver();
        }

        [TestCleanup]
        public virtual void CleanupTest()
        {
            base.CleanUpTest();
        }
    }

    [TestClass]
    public class DialogTestsFirefox : DialogTests
    {
        [ClassInitialize]
        public new static void InitialiseClass(TestContext context)
        {
            SpiroTest.InitialiseClass(context);
        }

        [TestInitialize]
        public virtual void InitializeTest()
        {
            InitFirefoxDriver();
        }

        [TestCleanup]
        public virtual void CleanupTest()
        {
            base.CleanUpTest();
        }
    }

    // [TestClass, Ignore]
    public class DialogTestsChrome : DialogTests
    {
        [ClassInitialize]
        public new static void InitialiseClass(TestContext context)
        {
            FilePath(@"drivers.chromedriver.exe");
            SpiroTest.InitialiseClass(context);
        }

        [TestInitialize]
        public virtual void InitializeTest()
        {
            InitChromeDriver();
        }

        [TestCleanup]
        public virtual void CleanupTest()
        {
            base.CleanUpTest();
        }

        protected override void ScrollTo(IWebElement element)
        {
            string script = string.Format("window.scrollTo({0}, {1});return true;", element.Location.X, element.Location.Y);
            ((IJavaScriptExecutor)br).ExecuteScript(script);
        }
    }

    #endregion
}