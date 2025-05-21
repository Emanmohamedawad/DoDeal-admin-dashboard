import { appWithTranslation } from "next-i18next";
import { Provider } from "react-redux";
import { store } from "../store";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  const dir = pageProps?.locale === "ar" ? "rtl" : "ltr";
  return (
    <Provider store={store}>
      <div dir={dir}>
        <Component {...pageProps} />
      </div>
    </Provider>
  );
}

export default appWithTranslation(MyApp);
