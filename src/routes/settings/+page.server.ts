import { importSecurities } from "@/lib/utils/import-securities";
import type { Actions } from "./$types";

async function doMagic() {
    await importSecurities();
}


export const actions: Actions = {
	importSecurities: async (_) => {
        doMagic();
        return;
	}
};