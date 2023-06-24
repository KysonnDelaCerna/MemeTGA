import { createApp } from "vue";
import App from "./App.vue";
import axios from "axios";
import VueAxios from "vue-axios";
import PrimeVue from "primevue/config";
import "primevue/resources/primevue.min.css";
import "primevue/resources/themes/tailwind-light/theme.css";
import "./tailwind.css";

import Checkbox from "primevue/checkbox";
import Divider from "primevue/divider";
import ToggleButton from "primevue/togglebutton";
import InputNumber from "primevue/inputnumber";
import ProgressSpinner from "primevue/progressspinner";
import TextArea from "primevue/textarea";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import Message from "primevue/message";

const app = createApp(App);

app.use(VueAxios, axios);
app.use(PrimeVue);

app.component("Checkbox", Checkbox);
app.component("Divider", Divider);
app.component("ToggleButton", ToggleButton);
app.component("InputNumber", InputNumber);
app.component("ProgressSpinner", ProgressSpinner);
app.component("TextArea", TextArea);
app.component("Button", Button);
app.component("Dropdown", Dropdown);
app.component("Message", Message);

app.mount("#app");
