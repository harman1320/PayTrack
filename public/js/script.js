// ToolTip
const tooltipTriggerList = document.querySelectorAll(
  '[data-bs-toggle="tooltip"]',
);
const tooltipList = [...tooltipTriggerList].map(
  (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl),
);

//  Delete Form
let delbtns = document.querySelectorAll(".del-btn");

for (let btn of delbtns) {
  btn.addEventListener("click", () => {
    alert("Are you sure you want to delete the Employee");
  });
}
