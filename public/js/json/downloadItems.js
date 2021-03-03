const downloadItems = {
    Triton: {
        0: [{
            name: "Triton Soakage Calculator",
            link: "https://3724441.app.netsuite.com/core/media/media.nl?id=3064173&c=3724441&h=b7cb3db22af5a0775b9e&_xt=.xls"
        }],
        1: [{
            name: "Triton Standard Drawings (DWG)",
            link: "https://3724441.app.netsuite.com/core/media/media.nl?id=3064175&c=3724441&h=f1e23bd04714b5051b43&_xt=.dwg"
        }],
        2: [{
            name: "Triton Chambers",
            link: "https://3724441.app.netsuite.com/core/media/media.nl?id=3064175&c=3724441&h=f1e23bd04714b5051b43&_xt=.dwg"
        }],
        3: [{
            name: "Triton Perpendicular Header Row",
            link: "https://3724441.app.netsuite.com/core/media/media.nl?id=3064177&c=3724441&h=f5886ab7c86815e58c1d&_xt=.pdf"
        }],
        4: [{
            name: "Triton Perpendicular Header Row with Liner",
            link: "https://3724441.app.netsuite.com/core/media/media.nl?id=3064178&c=3724441&h=9eef830df1a6c7a646af&_xt=.pdf"
        }],
        5: [{
            name: "Triton Parallel Header Row",
            link: "https://3724441.app.netsuite.com/core/media/media.nl?id=3064176&c=3724441&h=4e2a6f74cb57991b1bd3&_xt=.pdf"
        }],
        6: [{
            name: "Triton Parallel Header Row with Liner",
            link: "https://3724441.app.netsuite.com/core/media/media.nl?id=3064179&c=3724441&h=19e6a8d1b4755fa5e8bd&_xt=.pdf"
        }],
        7: [{
            name: "Triton Double Stack",
            link: "https://3724441.app.netsuite.com/core/media/media.nl?id=3064181&c=3724441&h=8d49a09db60270a3dcdc&_xt=.pdf"
        }],
        8: [{
            name: "Triton Double Stack with Liner",
            link: "https://3724441.app.netsuite.com/core/media/media.nl?id=3064182&c=3724441&h=96640e2e8012973460cb&_xt=.pdf"
        }],
        9: [{
            name: "Triton Double Stack Parallel",
            link: "https://3724441.app.netsuite.com/core/media/media.nl?id=4035341&c=3724441&h=4cf238365f84cdd2fbfb&_xt=.pdf&fcts=20200223130104&whence="
        }],
        10: [{
            name: "Triton Double Stack Parallel with Liner",
            link: "https://3724441.app.netsuite.com/core/media/media.nl?id=4035343&c=3724441&h=23ec0e1253864aec963c&_xt=.pdf&fcts=20200223130141&whence="
        }]
    },
    TritonVault: {
        0: [{
            name: "Triton Vault Single Stack",
            link: "https://3724441.app.netsuite.com/core/media/media.nl?id=2915679&c=3724441&h=e2472877fa927665eb5c&_xt=.pdf"
        }],
        1: [{
            name: "Triton Vault Standard Drawing",
            link: "https://3724441.app.netsuite.com/core/media/media.nl?id=2915675&c=3724441&h=6c15b51d4566afdb7e8e&_xt=.pdf&fcts=20200813151230&whence="
        }],
        2: [{
            name: "Triton Vault Soakage Calculator",
            link: "https://3724441.app.netsuite.com/core/media/media.nl?id=4408385&c=3724441&h=91e664c7ec140a79ccc2&_xt=.xls"
        }],
    },
    RainSmart: {
        0: [{
            name: "RainSmart Stormwater Calculator",
            link: "https://3724441.app.netsuite.com/core/media/media.nl?id=3805868&c=3724441&h=cbb91fa5cc8f1ec8bce7&_xt=.xls"
        }],
        1: [{
            name: "RainSmart Standard Drawings (DWG)",
            link: "https://3724441.app.netsuite.com/core/media/media.nl?id=3064180&c=3724441&h=d3e71f6c559be6a7b141&_xt=.dwg"
        }],
        2: [{
            name: "RainSmart Soakage 150mm Linear Access",
            link: "https://3724441.app.netsuite.com/core/media/media.nl?id=2454946&c=3724441&h=4841d4b91c5c2b068ca5&_xt=.pdf"
        }],
        3: [{
            name: "RainSmart Lined 150mm Linear Access",
            link: "https://3724441.app.netsuite.com/core/media/media.nl?id=2454948&c=3724441&h=9a5c60fc5248008516e7&_xt=.pdf"
        }],
        4: [{
            name: "RainSmart Soakage 300mm Linear Access",
            link: "https://3724441.app.netsuite.com/core/media/media.nl?id=2454945&c=3724441&h=b81780d1fb9c3cb9c324&_xt=.pdf"
        }],
        5: [{
            name: "RainSmart Lined 300mm Linear Access",
            link: "https://3724441.app.netsuite.com/core/media/media.nl?id=2454947&c=3724441&h=9ff7fa7afadf311862f7&_xt=.pdf"
        }],
    }
}

renderDownloads("Triton", document.querySelector('#tritonDownloads'))
renderDownloads("TritonVault", document.querySelector('#tritonVaultDownloads'))
renderDownloads("RainSmart", document.querySelector('#rainSmartDownloads'))

function renderDownloads(product, parent) {
    for(i = 0; i < Object.keys(downloadItems[product]).length; i++) {
        let button = document.createElement('button')
        button.className = "ctx-download-btn"
        button.innerHTML = `<i class="fal fa-arrow-circle-down"></i>&nbsp;&nbsp;${downloadItems[product][i][0].name}`
        let link = document.createElement('a')
        link.href = downloadItems.Triton[i][0].link
        link.target = "_blank"
        link.appendChild(button)
        parent.appendChild(link)
    }
}