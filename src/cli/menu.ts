import { text, isCancel }  from '@clack/prompts'

import { fileSystem } from '../utils/file-system'

await fileSystem().listsFeatures()

try {
    const name = await text({
        message: 'What is your name'
    })

    if (isCancel(name)) {
        console.log('Operation cancelled')
        process.exit(0)
    }
} catch (error) {
    console.log('An error occurred', error)
    process.exit(1)
}