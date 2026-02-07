import express from "express";
import db from "../config/db.js";
import ensureAuthenticated from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  res.render("index.ejs", {});
});

//^ -----------------    Main Store Page <-------------------------------
router.get("/main", ensureAuthenticated, async (req, res) => {
  // console.log(req.user);
  const result = await db.query(
    "select * from products inner join categories using (cat_id) ORDER BY prod_id asc",
  );
  const userCart = (
    await db.query(
      `select * from cart inner join products using (prod_id) where user_id = $1`,
      [req.user.user_id],
    )
  ).rows;

  let products = [];
  products = result.rows;
  //let Group products by category
  const categoriesMap = {};
  const cartMap = {};

  if (userCart && userCart.length > 0) {
    userCart.forEach((item) => {
      cartMap[item.prod_id] = Number(item.cart_quantity);
    });
  }
  let cartQuantity = 0;
  products.forEach((product) => {
    const catId = product.cat_id;
    if (!categoriesMap[catId]) {
      categoriesMap[catId] = {
        name: product.cat_name, // Make sure your DB has category names
        products: [],
      };
    }

    cartQuantity = cartMap[product.prod_id] || 0;

    const availableQty = product.quantity - cartQuantity;

    categoriesMap[catId].products.push({
      id: product.prod_id,
      name: product.prod_name,
      price: product.price,
      image: product.imageurl,
      quantity: availableQty,
    });
  });
  const cartCountResult = await db.query(
    `SELECT COALESCE(SUM(cart_quantity), 0) AS count
      FROM cart
      WHERE user_id = $1`,
    [req.user.user_id],
  );
  const resultBalance = await db.query(
    `SELECT COALESCE(SUM(price * cart_quantity), 0) as sum from cart inner join products using (prod_id) where user_id = $1`,
    [req.user.user_id],
  );
  const CurrentBalance = resultBalance.rows[0].sum;
  const cartCount = cartCountResult.rows[0].count;
  const categoriesArray = Object.values(categoriesMap);
  res.render("main.ejs", {
    balance: (
      parseFloat(req.user.balance) - parseFloat(CurrentBalance)
    ).toFixed(2),
    categories: categoriesArray,
    cartCount: cartCount,
    user: req.user,
  });
}); //end of main route

//^ -----------------    Cart Page <-------------------------------
router.get("/cart", ensureAuthenticated, async (req, res) => {
  try {
    const userCart = await db.query(
      `select * from cart inner join products using (prod_id) where user_id = $1`,
      [req.user.user_id],
    );
    const cart = userCart.rows;
    const cartCountResult = await db.query(
      `SELECT COALESCE(SUM(cart_quantity), 0) AS count FROM cart WHERE user_id = $1`,
      [req.user.user_id],
    );
    const priceSum = await db.query(
      `select COALESCE(sum(price * cart_quantity), 0) as sum from cart inner join products using (prod_id) where user_id = $1`,
      [req.user.user_id],
    );
    const cartCount = cartCountResult.rows[0].count;
    const balance =
      parseFloat(req.user.balance) - parseFloat(priceSum.rows[0].sum);
    res.render("cart.ejs", {
      balance: balance.toFixed(2),
      cart: cart,
      cartCount: cartCount,
      user: req.user,
      totalPrice: parseFloat(priceSum.rows[0].sum).toFixed(2),
    });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.redirect("/main");
  }
});
//^ -----------------    Add to Cart <-------------------------------
router.post("/addToCart", ensureAuthenticated, async (req, res) => {
  const productId = parseInt(req.body.productId);
  const productPrice = parseFloat(req.body.productPrice);
  const balance = parseFloat(req.body.balance);
  const productQuantity = parseInt(req.body.productQuantity);

  if (balance < productPrice) {
    return res
      .status(400)
      .json({ success: false, message: "Not enough balance" });
  } else if (productQuantity == 0) {
    return res
      .status(400)
      .json({ success: false, message: "Product is out of stock" });
  } else {
    // 1. Add to cart
    const cart_info = await db.query(
      "insert into cart (user_id, prod_id, cart_quantity) values ($1, $2, 1) ON CONFLICT (user_id, prod_id) DO UPDATE SET cart_quantity = cart.cart_quantity + 1 RETURNING cart_quantity",
      [req.user.user_id, productId],
    );
    const cartCountResult = await db.query(
      `SELECT COALESCE(SUM(cart_quantity), 0) AS count
      FROM cart
      WHERE user_id = $1`,
      [req.user.user_id],
    );
    const cartQuantity = cart_info.rows[0].cart_quantity;
    const newBalance = parseFloat(balance) - parseFloat(productPrice);

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      newQuantity: productQuantity - 1,
      productId: productId,
      cartCount: cartCountResult.rows[0].count,
      newBalance: newBalance.toFixed(2),
    });
  }
});
//^ -----------------           Delete Item from Cart <-------------------------------
router.post("/cart/delete-item", ensureAuthenticated, async (req, res) => {
  const productId = req.body.productId;
  const cartQuantity = req.body.cartQuantity;
  const productPrice = req.body.productPrice;
  const balance = req.body.balance;
  try {
    await db.query("delete from cart where user_id = $1 and prod_id = $2", [
      req.user.user_id,
      productId,
    ]);
    const priceSum = await db.query(
      `select COALESCE(sum(price * cart_quantity), 0) as sum from cart inner join products using (prod_id) where user_id = $1`,
      [req.user.user_id],
    );
    const newBalance =
      parseFloat(balance) + parseFloat(cartQuantity) * parseFloat(productPrice);
    res.status(200).json({
      success: true,
      message: "Product deleted from cart",
      totalPrice: parseFloat(priceSum.rows[0].sum).toFixed(2),
      newBalance: newBalance.toFixed(2),
    });
  } catch (error) {
    console.error("Error deleting item from cart:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete item from cart" });
  }
});
//^ -----------------           Checkout <-------------------------------
router.post("/cart/checkout", ensureAuthenticated, async (req, res) => {
  try {
    await db.query("BEGIN");
    let flag = false;
    const userCart = await db.query(
      `select * from cart inner join products using (prod_id) where user_id = $1`,
      [req.user.user_id],
    );
    const cart = userCart.rows;
    const priceSum = await db.query(
      `select COALESCE(sum(price * cart_quantity), 0) as sum from cart inner join products using (prod_id) where user_id = $1`,
      [req.user.user_id],
    );
    const totalPrice = Number(priceSum.rows[0].sum);
    if (Number(req.user.balance) < totalPrice) {
      return res.status(400).json({
        success: false,
        message: "Not enough balance",
      });
    }
    if (cart.length === 0) {
      throw new Error("Cart is empty");
    }
    if (cart.length > 0) {
      for (const item of cart) {
        if (item.cart_quantity > item.quantity) {
          return res.status(400).json({
            success: false,
            message: item.prod_name + " is out of stock",
          });
        }
        await db.query(
          "update products set quantity = quantity - $1 where prod_id = $2",
          [item.cart_quantity, item.prod_id],
        );
      }
      await db.query(
        "update users set balance = balance - $1 where user_id = $2",
        [totalPrice, req.user.user_id],
      );
      const updatedUser = await db.query(
        "SELECT * FROM users WHERE user_id = $1",
        [req.user.user_id]
      );
      req.login(updatedUser.rows[0], (err) => {
        if (err) console.error(err);
      });
      flag = true;
    }
    if (flag) {
      await db.query("delete from cart where user_id = $1", [req.user.user_id]);
      await db.query("COMMIT");
      res.status(200).json({
        success: true,
        message: "Order placed successfully",
      });
    }
  } catch (err) {
    await db.query("ROLLBACK");
    res.status(500).json({
      success: false,
      message: "Checkout failed",
    });
  }
});
export default router;
