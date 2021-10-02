"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.desc = exports.command = void 0;
exports.command = 'get <address>';
exports.desc = 'Query <address>\'s ABI';
const axios_1 = __importDefault(require("axios"));
const Table = require('cli-table');
const serializeParams = (it, ctx) => it.map((it) => `${it.name || ''}:${it.type}`).join('\n');
// String.prototype.capitalize = function () {
//     return this.charAt(0).toUpperCase() + this.slice(1)
// }
Table.prototype.getData = function () {
    return this.slice(0);
};
// Table.prototype.getDataObject = function () {
//     return this.slice(0).map((it:) => _.object(this.getHead(), it))
// }
Table.prototype.getHead = function () {
    return this.options.head;
};
const getAbiTableData = (abi) => {
    const rows = [];
    let head = [
        'idx',
        '?',
        'name',
        'type',
        // "const",
        // 'payable',
        'len',
        'inputs',
        'outputs',
        'stateMutability',
        'signature',
    ];
    const indexedFuncs = {};
    for (const [idx, func] of Object.entries(abi).slice(0)) {
        // indexedFuncs[func.name] = Object.assign({}, func)
    }
    //     func.inputs = func.inputs || []
    //     func.outputs = func.outputs || []
    //     func.name = func.name || ''
    //     func.stateMutability = func.stateMutability || ''
    //     func.isInConstructor = isInConstructor(abi, func.name)
    //     const row = [
    //         idx,
    //         func.isInConstructor,
    //         func.name,
    //         func.type,
    //         // func.constant || "",
    //         // func.payable || '',
    //         func.inputs.length,
    //         serializeParams(func.inputs, func),
    //         serializeParams(func.outputs, func),
    //         func.stateMutability,
    //         func.signature || '',
    //     ]
    //     rows.push(row)
    // }
    const methodsTable = new Table({ head, rows });
    return {
        indexedFuncs,
        table: methodsTable,
    };
};
async function getAbi({ BSCSCAN_URL, address }) {
    const Conf = require('conf');
    const config = new Conf();
    let cacheKey = `${BSCSCAN_URL}${address}`.toLowerCase();
    let cache = config.get(cacheKey);
    if (cache) {
        return cache;
    }
    const url = `${BSCSCAN_URL}&action=getabi&address=${address}`;
    const httpResult = await axios_1.default.get(url);
    if (httpResult.status !== 200) {
        throw new Error(`${httpResult.status} ${httpResult.statusText}`);
    }
    else {
        const abi = httpResult.data;
        if (abi.status === '1') {
            const out = JSON.parse(abi.result);
            config.set(cacheKey, out);
            return out;
        }
        else {
            throw new Error(`${abi.status} ${abi.message}`);
        }
    }
}
const builder = (yargs) => yargs
    .options({
    table: { type: 'boolean' },
})
    .positional('address', { type: 'string', demandOption: true });
exports.builder = builder;
const handler = (argv) => {
    const { address, table } = argv;
    console.log(table, address);
    getAbi({
        BSCSCAN_URL: 'https://api.bscscan.com/api?module=contract',
        address
    }).then(abi => {
        console.log(abi);
    });
};
exports.handler = handler;
(0, exports.handler)({ address: '0x3c0Bba9a0b4D920e2d1809D5952b883ABeEa6B5b', table: true });
