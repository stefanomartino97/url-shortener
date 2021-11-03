//Error and success fade-out

const error = $('#error');
const success = $('#success');

if (error){
    error.fadeOut(2000);
}

if (success){
    success.fadeOut(2000);
}

//Dynamic visit increment
if ($('table')){
    const rows = $('tr');
    for (let i = 1; i < rows.length; i++){
        const tds = rows[i].children;
        tds[1].children[0].onclick = () => {
            const currentValue = parseInt(tds[2].innerHTML);
            tds[2].innerHTML = (currentValue + 1).toString();
        }
        
    }
}
