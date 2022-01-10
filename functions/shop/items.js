function shopItems() {
    const items = [{ name: "Magazine", price: 2500, currency: "Opals" },
    { name: "Random Hue", price: 20, currency: "Diamonds" },
    { name: "Custom Hue", price: 30, currency: "Diamonds" },
    { name: "Random Hue Bundle", price: 80, currency: "Diamonds" },
    { name: "Themed Hue Bundle", price: 100, currency: "Diamonds" },
    { name: "Frame", price: 50, currency: "Diamonds" },
    { name: "Sticker", price: 20, currency: "Diamonds" }]
    return items;
}

module.exports = {
    shopItems
};