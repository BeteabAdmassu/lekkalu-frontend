import React, { useMemo, useState } from 'react'
import { useLocation } from 'react-router'
import { isEmpty } from 'lodash'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pie, PieChart, Cell, Tooltip, Legend } from 'recharts'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { parseQueryString } from '@/utils/query-string'
import { sipCalculatorSchema } from '@/schema/calculators'
import { Form } from '@/components/ui/form'
import { calculateSip } from '@/utils/calculators'
import { CustomLabelPie } from '@/components/shared/CustomLabelPie/CustomLabelPie'
import When from '@/components/When/When'
import { useToast } from '@/components/ui/use-toast'
import { handleShare } from '@/utils/clipboard'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import InputFieldsRenderer, { InputField } from '@/components/InputFieldsRenderer/InputFieldsRenderer'
import Page from '@/components/Page/Page'

const DEFAULT_DATA = {
  monthlyAmount: 500,
  durationInvestment: 1,
  rateReturn: 1,
}

type SipValues = z.infer<typeof sipCalculatorSchema>

export default function SIPCalculator() {
  const location = useLocation()
  const parsedObject = parseQueryString(location.search)
  const [isCopied, setIsCopied] = useState(false)
  const { toast } = useToast()
  const { preferences } = useUserPreferences()

  const form = useForm<SipValues>({
    resolver: zodResolver(sipCalculatorSchema),
    defaultValues: !isEmpty(parsedObject) ? parsedObject : DEFAULT_DATA,
  })
  const values = form.watch()

  const inputs: Array<InputField> = [
    {
      id: 'monthlyAmount',
      label: `Monthly investment amount ${preferences.currencyUnit}`,
      type: 'number',
      hasRange: true,
      range: {
        min: 500,
        max: 100_000,
        step: 500,
      },
    },
    {
      id: 'durationInvestment',
      label: 'Duration of the investment (Yr)',
      type: 'number',
      hasRange: true,
      range: {
        min: 1,
        max: 40,
        step: 1,
      },
    },
    {
      id: 'rateReturn',
      label: 'Expected annual return (%)',
      type: 'number',
      hasRange: true,
      range: {
        min: 1,
        max: 30,
        step: 0.1,
      },
    },
  ]

  const result = useMemo(() => {
    if (!values.durationInvestment || !values.monthlyAmount || !values.rateReturn) {
      return undefined
    }

    const summary = calculateSip(values.monthlyAmount, values.durationInvestment, values.rateReturn)
    const pieData = [
      { name: 'Total Invested', value: summary.totalInvested },
      { name: 'Wealth Gained', value: summary.wealthGained },
    ]

    return { summary, pieData }
  }, [values.durationInvestment, values.monthlyAmount, values.rateReturn])

  const handleCopy = () => {
    setIsCopied(true)
    handleShare(values)
    setTimeout(() => setIsCopied(false), 3000)
  }

  return (
    <Page className='space-y-4'>
      <div className='flex items-center justify-between'>
        <Button
          onClick={() => {
            toast({
              title: 'Feature under development!',
              description: 'The feature you are trying to use is under development!',
            })
          }}
        >
          Save
        </Button>
        <Button onClick={handleCopy}>{isCopied ? 'Copied!' : 'Share'}</Button>
      </div>

      <div className='text-center'>
        <h2 className='text-2xl font-bold'>SIP Calculator</h2>
        <p>Calculate returns on your SIP investments.</p>
      </div>

      <div className='flex flex-col md:flex-row gap-4 items-center justify-center w-full'>
        <div className='space-y-4'>
          <Form {...form}>
            <form className='grid gap-4'>
              <InputFieldsRenderer control={form.control} inputs={inputs} />
            </form>
          </Form>
        </div>

        <When truthy={typeof result !== 'undefined'}>
          <div>
            <div className='text-xl text-center'>Summary</div>

            <div className='w-full p-4 flex flex-col gap-4 items-center'>
              <div className='flex gap-2 border-b'>
                <div>Total invested: </div>
                <div className='font-medium'>
                  {result?.summary?.totalInvested} {preferences.currencyUnit}
                </div>
              </div>
              <div className='flex gap-2 border-b'>
                <div>Final value: </div>
                <div className='font-medium'>
                  {result?.summary?.finalValue} {preferences.currencyUnit}
                </div>
              </div>
              <div className='flex gap-2 border-b'>
                <div>Wealth gained: </div>
                <div className='font-medium'>
                  {result?.summary?.wealthGained} {preferences.currencyUnit}
                </div>
              </div>

              <PieChart width={200} height={220}>
                <Pie dataKey='value' data={result?.pieData} outerRadius={80} labelLine={false}>
                  {result?.pieData.map((item, index) => (
                    <Cell key={index} fill={item.name.includes('Total Invested') ? '#099fea' : '#09ea49'} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip content={<CustomLabelPie />} />
              </PieChart>
            </div>
          </div>
        </When>
      </div>
    </Page>
  )
}
