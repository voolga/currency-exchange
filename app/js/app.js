// // Import vendor jQuery plugin example
// import '~/app/libs/mmenu/dist/mmenu.js'

document.addEventListener("DOMContentLoaded", () => {
  const selects = document.querySelectorAll(".select");
  let pair = {
    from: "",
    to: "",
  };
  const amountInput = document.getElementById("amount");
  const form = document.querySelector(".form");
  const resultFrom = document.getElementById("resultFrom");
  const resultTo = document.getElementById("resultTo");
  const formResults = document.querySelector(".form-results");
  const rateConversion = document.querySelector(".rate-conversion");
  const rateLast = document.querySelector(".rate-last");
  const switchButton = document.querySelector(".switch-currencies");
  const fromSelect = document.getElementById("from");
  const toSelect = document.getElementById("to");
  const tabs = document.querySelectorAll(".tab");
  const currentCurrency = document.querySelector(".currency-single__item");
  const currentCurrencyList = document.querySelector(".currency-list");

  tabs.forEach((tab) => tab.addEventListener("click", handleTabClick));

  function handleTabClick({ currentTarget: target }) {
    const tab = target.dataset.tab;
    console.log(target.dataset.tab);
    const children = document.querySelectorAll(".content");

    tabs.forEach((item) => item.classList.remove("active"));
    target.classList.add("active");

    for (let child of children) {
      if (child.dataset.tab === tab) {
        child.classList.add("show");
      } else if (child.dataset.child === tab) {
        child.classList.add("show");
      } else {
        child.classList.remove("show");
      }
    }
  }

  let fullList = [];

  async function getCurrencies() {
    const response = await fetch(
      "https://v6.exchangerate-api.com/v6/400338609ef6ae16343a5e94/codes"
    );
    const data = await response.json();
    console.log(data);
    const codes = Object.assign([], data.supported_codes);
    console.log(codes);
    fullList = codes;
    renderCodeList(codes);
    fetchLatest();

    // createListFullNames(codes);

    // const response = await fetch(
    //   "https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_p092hAjwk9rf42dBNakEIy4kwlweQuzwRdiKOfWd"
    // );
    // const data = await response.json();
    // const codes = Object.assign({}, data.data);
    // renderCodeList(codes);
  }

  function renderCodeList(data) {
    // console.log(data);
    selects.forEach((select) => {
      data.forEach((item) => {
        const addOptionElement = document.createElement("option");
        addOptionElement.innerText = item[0];
        select.append(addOptionElement);
      });

      select.addEventListener("change", handleChange);
    });
  }

  // function createListFullNames(codeList) {
  //   const codeFullNames = Object.assign([], codeList);
  //   return codeFullNames;
  // }

  function handleChange({ target: { value, name } }) {
    // console.log(value, name);
    pair = {
      ...pair,
      [name]: value,
    };
    console.log(pair);
  }

  getCurrencies();

  amountInput.addEventListener("keyup", handleInput);

  function handleInput({ target: { value, name } }) {
    pair = {
      ...pair,
      [name]: +value,
    };

    console.log(pair);
  }

  form.addEventListener("submit", handleSubmit);

  async function handleSubmit(e) {
    e.preventDefault();

    const { from, to, amount } = pair;

    if (!amount || !from || !to) return;

    try {
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/400338609ef6ae16343a5e94/pair/${from}/${to}/${amount}`
      );
      const data = await response.json();
      console.log(data);

      insertResults(data);
    } catch (err) {
      console.log(err);
    }
  }

  const insertResults = ({
    base_code: baseCode,
    target_code: targetCode,
    conversion_rate: rate,
    conversion_result: result,
    time_last_update_utc: time,
  }) => {
    const from = {
      code: baseCode,
      amount: amount.value,
      full: getFullTitle(fullList, baseCode),
    };

    const to = {
      code: targetCode,
      amount: result,
      full: getFullTitle(fullList, targetCode),
    };

    resultFrom.innerHTML = renderResultForm(from);
    resultTo.innerHTML = renderResultForm(to);

    const baseValue = formatToCurrency(baseCode, 1);
    const targetValue = formatToCurrency(targetCode, rate);

    rateConversion.innerText = `${baseValue} = ${targetValue}`;

    rateLast.innerText = `Updated ${convertTime(time)}`;

    formResults.classList.add("show");

    // console.log(rateLast);
  };

  // console.log(pair);

  function getFullTitle(codes, code) {
    const [, title] = codes.find((item) => item.includes(code));

    return title;
  }

  const renderResultForm = ({ code, amount, full }) => {
    return `<div class="form-result__item from" id="resultFrom">
    <div class="form-result__item-icon icon">
      <img src="../images/src/Vectorto-arrow.png" alt="" />
    </div>

    <div class="form-result__item-titles">
      <div class="form-result__item-title">${code}</div>
      <div class="form-result__item-full">${full}</div>
    </div>

    <div class="form-result__item-value">${amount}</div>
    </div>`;
  };

  const formatToCurrency = (code, amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const convertTime = (date) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    return new Intl.DateTimeFormat("en-US", options).format(new Date(date));
  };

  switchButton.addEventListener("click", switchCurrencies);

  function switchCurrencies() {
    const { to, from } = pair;

    if (!to || !from) return;

    pair.to = from;
    pair.from = to;

    fromSelect.value = to;
    toSelect.value = from;

    console.log(to);
    console.log(from);
  }

  // SINGLE PAGE

  const state = {
    currency: {
      code: "USD",
    },
    currencies: ["USD", "EUR", "PLN"],
    actions: {
      remove: "remove",
      change: "change",
    },
  };
  const code = state.currency.code;

  const fetchLatest = async () => {
    if (!code) return;
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/400338609ef6ae16343a5e94/latest/${code}`
    );
    const data = await response.json();

    state.currency = { ...state.currency, ...data };
    console.log(state.currency);
    insertCurrencies();
    try {
    } catch (err) {
      console.log(err);
    }
  };

  const insertCurrencies = () => {
    const { currency } = state;
    const { conversion_rates: rates, base_code: baseCode } = currency;
    const isBase = code === baseCode;
    const action = getCurrencyActionToButton(isBase);
    const full = getFullTitle(fullList, code);
    let rate = 1.0;

    currentCurrency.innerHTML = `<div class="currency-item ${
      isBase ? "currency-current" : ""
    } ">
                                    <div class="currency-titles">
                                      <div class="currency-title">${code}</div>
                                      <div class="currency-full">${full}</div>
                                    </div>

                                    <div class="currency-amount">${rate}</div>
                                    <div class="currency-action">
                                      ${action}
                                    </div>`;

    Object.entries(rates).forEach(([code, rate]) => {
      if (code === baseCode || !state.currencies.includes(code)) return;
      insertCurrency(currency, code, rate);
    });
  };

  const insertCurrency = (currency, code, rate) => {
    console.log(currency);
    let fullName = getFullTitle(fullList, code);

    currentCurrencyList.insertAdjacentHTML(
      "afterbegin",
      `<div class="currency-item" 'currency-current'} ">
                      <div class="currency-titles">
                        <div class="currency-title">${code}</div>
                        <div class="currency-full">${fullName}</div>
                      </div>

                      <div class="currency-amount">${rate}</div>
                      <div class="currency-action">
                        <button class="currency-change currency-button">
                          Change
                        </button>
                      </div>`
    );
  };

  const getCurrencyActionToButton = (isBase) => {
    const {
      actions: { remove, change },
    } = state;
    const actionName = isBase ? change : remove;
    return `<button class="currency-${actionName} currency-button data-action="${actionName}">
${actionName}
</button>`;
  };

  currentCurrency.addEventListener("click", handleActionClick);
  currentCurrencyList.addEventListener("click", handleActionClick);

  const removeCurrency = (target) => {
    const parent = target.parentElement.parentElement;
    const { item } = parent.dataset;

    const element = document.querySelector(`[data-item="${item}"]`);
    element.remove();
  };

  const handleActionClick = ({ target }) => {
    const { action } = target.dataset;

    const {
      actions: { remove },
    } = state;

    action === remove ? removeCurrency(target) : () => {};
  };
});
