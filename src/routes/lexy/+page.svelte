<script lang="ts">
    import Button from "@/lib/components/ui/button/button.svelte";
    import Input from "@/lib/components/ui/input/input.svelte";
    import Label from "@/lib/components/ui/label/label.svelte";
    import * as Card from "@/lib/components/ui/card";
    import * as Accordion from "@/lib/components/ui/accordion";

    // Population data
    let englandPopulation = $state(56_000_000); // England's population (approx)
    
    // Consumption data
    let kgPorkPerPersonPerYear = $state(25); // Average pork consumption per person per year in kg
    
    // Production data
    let percentDomesticProduction = $state(60); // % of consumed pork produced domestically
    let avgPigWeight = $state(90); // Average pig weight in kg when slaughtered
    let avgEdibleMeatPerPig = $state(65); // % of pig weight that becomes edible meat
    let avgLifespanMonths = $state(6); // Average lifespan of a pig before slaughter in months
    
    // Calculated values
    let totalPorkConsumptionKg = $derived(englandPopulation * kgPorkPerPersonPerYear);
    let domesticPorkProductionKg = $derived(totalPorkConsumptionKg * (percentDomesticProduction / 100));
    let edibleMeatPerPigKg = $derived(avgPigWeight * (avgEdibleMeatPerPig / 100));
    let pigsSlaughteredPerYear = $derived(Math.round(domesticPorkProductionKg / edibleMeatPerPigKg));
    let pigsInEngland = $derived(Math.round(pigsSlaughteredPerYear * (avgLifespanMonths / 12)));
    
    // Explanation sections
    let showExplanation = $state(false);

    function toggleExplanation() {
        showExplanation = !showExplanation;
    }
</script>

<div class="container mx-auto p-4 max-w-3xl">
    <Card.Root class="mb-8">
        <Card.Header>
            <Card.Title class="text-2xl font-bold">Estimating Pigs in England</Card.Title>
            <Card.Description>
                A strategy consulting approach to estimating the pig population
            </Card.Description>
        </Card.Header>
        <Card.Content>
            <div class="grid gap-6">
                <div class="space-y-4">
                    <h2 class="text-xl font-semibold">Population Data</h2>
                    <div>
                        <Label for="englandPopulation">England Population</Label>
                        <Input id="englandPopulation" type="number" bind:value={englandPopulation} />
                    </div>
                </div>

                <div class="space-y-4">
                    <h2 class="text-xl font-semibold">Consumption Data</h2>
                    <div>
                        <Label for="kgPorkPerPersonPerYear">Kg of Pork Consumed Per Person Per Year</Label>
                        <Input id="kgPorkPerPersonPerYear" type="number" bind:value={kgPorkPerPersonPerYear} />
                    </div>
                </div>

                <div class="space-y-4">
                    <h2 class="text-xl font-semibold">Production Data</h2>
                    <div>
                        <Label for="percentDomesticProduction">% of Consumed Pork Produced Domestically</Label>
                        <Input id="percentDomesticProduction" type="number" bind:value={percentDomesticProduction} />
                    </div>
                    <div>
                        <Label for="avgPigWeight">Average Pig Weight at Slaughter (kg)</Label>
                        <Input id="avgPigWeight" type="number" bind:value={avgPigWeight} />
                    </div>
                    <div>
                        <Label for="avgEdibleMeatPerPig">% of Pig Weight That Becomes Edible Meat</Label>
                        <Input id="avgEdibleMeatPerPig" type="number" bind:value={avgEdibleMeatPerPig} />
                    </div>
                    <div>
                        <Label for="avgLifespanMonths">Average Lifespan of a Pig Before Slaughter (months)</Label>
                        <Input id="avgLifespanMonths" type="number" bind:value={avgLifespanMonths} />
                    </div>
                </div>
            </div>
        </Card.Content>
    </Card.Root>

    <Card.Root>
        <Card.Header>
            <Card.Title class="text-2xl font-bold">Results</Card.Title>
        </Card.Header>
        <Card.Content>
            <div class="space-y-4">
                <p class="text-xl font-bold">Estimated Pigs in England: {pigsInEngland.toLocaleString()}</p>
                
                <Button onclick={toggleExplanation}>
                    {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
                </Button>
                
                {#if showExplanation}
                    <Accordion.Root class="mt-4">
                        <Accordion.Item value="step1">
                            <Accordion.Trigger>Step 1: Calculate Total Pork Consumption</Accordion.Trigger>
                            <Accordion.Content>
                                <p>England's population ({englandPopulation.toLocaleString()} people) × Pork consumption per person ({kgPorkPerPersonPerYear} kg/year) = {totalPorkConsumptionKg.toLocaleString()} kg of pork consumed per year</p>
                            </Accordion.Content>
                        </Accordion.Item>
                        
                        <Accordion.Item value="step2">
                            <Accordion.Trigger>Step 2: Calculate Domestic Pork Production</Accordion.Trigger>
                            <Accordion.Content>
                                <p>Total pork consumption ({totalPorkConsumptionKg.toLocaleString()} kg) × Domestic production percentage ({percentDomesticProduction}%) = {domesticPorkProductionKg.toLocaleString()} kg of domestically produced pork</p>
                            </Accordion.Content>
                        </Accordion.Item>
                        
                        <Accordion.Item value="step3">
                            <Accordion.Trigger>Step 3: Calculate Pigs Slaughtered Per Year</Accordion.Trigger>
                            <Accordion.Content>
                                <p>Average pig weight ({avgPigWeight} kg) × Edible meat percentage ({avgEdibleMeatPerPig}%) = {edibleMeatPerPigKg.toFixed(1)} kg of edible meat per pig</p>
                                <p>Domestic pork production ({domesticPorkProductionKg.toLocaleString()} kg) ÷ Edible meat per pig ({edibleMeatPerPigKg.toFixed(1)} kg) = {pigsSlaughteredPerYear.toLocaleString()} pigs slaughtered per year</p>
                            </Accordion.Content>
                        </Accordion.Item>
                        
                        <Accordion.Item value="step4">
                            <Accordion.Trigger>Step 4: Calculate Total Pig Population</Accordion.Trigger>
                            <Accordion.Content>
                                <p>Pigs slaughtered per year ({pigsSlaughteredPerYear.toLocaleString()}) × Average lifespan ratio ({avgLifespanMonths}/12 months) = {pigsInEngland.toLocaleString()} pigs in England at any given time</p>
                                <p class="mt-2 text-sm">This calculation accounts for the fact that pigs live for {avgLifespanMonths} months before slaughter, so the total population at any time includes pigs at various stages of their lifecycle.</p>
                            </Accordion.Content>
                        </Accordion.Item>
                    </Accordion.Root>
                {/if}
            </div>
        </Card.Content>
    </Card.Root>
</div>