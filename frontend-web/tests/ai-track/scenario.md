# Natural-language scenario — FR-07 Add-to-Cart

Given: EShop web app running at http://localhost:5173, backend at http://localhost:3000.

Scenario: "As a registered customer, I log in with my account, open one of the
products, add it to my cart, then go to my cart and check that the product I
added is there."

Steps a QA would hand to an AI coding assistant:
1. Go to the login page and sign in with a test account.
2. Open any product from the catalog.
3. Add it to the cart.
4. Go to the cart page.
5. Verify the product I added shows up in the cart.

No implementation details, file paths, or existing test code were given beyond
this description — the intent is to reproduce what an AI assistant produces
from a plain scenario, before anyone has read `Login.jsx` / `ProductDetail.jsx`
/ `CartContext.jsx`.
