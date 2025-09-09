// public/js/newFeature.js
document.getElementById('featureForm').addEventListener('submit', async function(event) {
  event.preventDefault();
  const data = { inputField: event.target.inputField.value };
  const res = await fetch('/feature', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });
  const result = await res.json();
  alert(result.message);
});
