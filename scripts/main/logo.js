const SetLogo = () => {
    const logo = document.createElement("span");
    logo.style.fontSize = "1.25rem";
    logo.innerHTML = "with TDxToolkit";
    const container = document.querySelector(".organization-link");
    container.appendChild(logo);
}

const trySetLogo = () => {
    document.querySelector(".organization-link") ? SetLogo() : setTimeout(trySetLogo, 100);
    console.log("Failed...");
}

trySetLogo();