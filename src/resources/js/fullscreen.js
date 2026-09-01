<script>
    let full = document.getElementById('empty');
    let image = document.querySelector('[data-yamato]');
    let newDiv = document.createElement('div');
    let newImg = document.createElement('img');
    newImg.src = 'resources/images/yamato.jpeg';

    image.addEventListener('click', () => {
        full.appendChild(newDiv);
        full.style.backgroundColor = 'black';
        full.style.position = 'absolute';
        full.style.height = '600px';
        full.style.width = '95%';
        full.style.margin = 'auto';
        full.appendChild(newImg);
        newImg.style.height = '600px';
        newImg.style.width = '50%';
        newImg.style.display = 'block';
        newImg.style.margin = 'auto';

        if (full.style.display = 'block')
        {
            full.addEventListener('click', () => {
                full.remove();
            })
        }
    })
</script>