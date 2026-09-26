import "@fontsource-variable/martian-mono/wdth.css";
import "@fontsource-variable/geist";
import "./styles/base.css";
import { mount } from "svelte";
import App from "./App.svelte";

mount(App, { target: document.getElementById("app")! });
