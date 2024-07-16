let next = document.querySelector('.next')
let prev = document.querySelector('.prev')

next.addEventListener('click', function(){
    let items = document.querySelectorAll('.sl-item')
    document.querySelector('.sl-slide').appendChild(items[0])
})
prev.addEventListener('click', function(){
    let items = document.querySelectorAll('.sl-item')
    document.querySelector('.sl-slide').prepend(items[items.length - 1])
})

