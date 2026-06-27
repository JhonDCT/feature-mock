// import './cli/menu';
import { fileSystem } from './utils/file-system'

await fileSystem().listsFeatures()

// import fastify from "./infrastructure/webserver/fastify" 

// try {
//     await fastify.listen({ port: 3000 })
// } catch (err) {
//     fastify.log.error(err)
//     process.exit(1)
// }