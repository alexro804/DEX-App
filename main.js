/** Connect to Moralis server */
const serverUrl = "https://2ofe2xh4k0jl.usemoralis.com:2053/server";
const appId = "MR2l6I4DiXsylmYn3VDXnYQTZN7TP7Z8QOUlsDRo";
Moralis.start({ serverUrl, appId });

let currentTrade = {};
let currentSelectSide
let tokens;

async function init() {
  await Moralis.initPlugins();
  //await Moralis.enable();
  await listAvailableTokens();
  
}

async function listAvailableTokens() {
  const result = await Moralis.Plugins.oneInch.getSupportedTokens({
    chain: 'eth', // The blockchain you want to use (eth/bsc/polygon)
 });
  tokens = result.tokens;
  let parent = document.getElementById("token_list");
  for (const address in  tokens) {
    let token = tokens[address];
    let div  = document.createElement("div");
    div.setAttribute ("data-address", address)
    div.className = "token_row";
    let html = ` 
      <img class="token_list_img" src="${token.logoURI}"
      <span class= "token_list_text"> ${token.symbol}</span>   
    `
    div.innerHTML = html;
    div.onclick = (() => {selectToken(address)});
    parent.appendChild(div);
  }

}

async function selectToken (address) {
   closeModal();
   currentTrade [currentSelectSide] = tokens[address];
   console.log(currentTrade);
   renderInterface();
}

function renderInterface(){
  
  if (currentTrade.from){
    document.getElementById("from_token_img").src = currentTrade.from.logoURI;
    document.getElementById("from_token_text").innerHTML = currentTrade.from.symbol;
  
  }
  
  if (currentTrade.to){
    document.getElementById("to_token_img").src = currentTrade.to.logoURI;
    document.getElementById("to_token_text").innerHTML = currentTrade.to.symbol;
  }
}
/** Add from here down */
async function login() {
  let user = Moralis.User.current();
  if (!user) {
   try {
      user = await Moralis.authenticate({ signingMessage: "Hello World!" })
      console.log(user)
      console.log(user.get('ethAddress'))
   } catch(error) {
     console.log(error)
   }
  }
}

function openModal(side){
  currentSelectSide = side;
  document.getElementById("token_modal").style.display = "block";

}

function closeModal(){
  document.getElementById("token_modal").style.display = "none";
}

async function getQuote (){
  if (!currentTrade.from || currentTrade.to || document.getElementById("from_amount").value) 
  return;
  let amount = Number(Moralis.Units.ETH(document.getElementById("from_amount").value))

  const quote = await Moralis.Plugins.oneInch.quote({
    chain: 'eth', 
    fromTokenAddress: currentTrade.from.address, 
    toTokenAddress: currentTrade.to.address, 
    amount: amount,
  })
  console.log(quote);
}

init();


document.getElementById ("modal_close").onclick = closeModal;
document.getElementById ("from_token_select").onclick = (() => {openModal("from")});
document.getElementById ("to_token_select").onclick = (() => {openModal("to")});
document.getElementById ("btn-login").onclick = login;
document.getElementById ("from_amount").onblur = getQuote;

/** Useful Resources  */

// https://docs.moralis.io/moralis-server/users/crypto-login
// https://docs.moralis.io/moralis-server/getting-started/quick-start#user
// https://docs.moralis.io/moralis-server/users/crypto-login#metamask

/** Moralis Forum */

// https://forum.moralis.io/