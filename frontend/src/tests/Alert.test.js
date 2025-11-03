import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Alert from '@/components/Alert.vue'

describe('Alert Component', () => {
    it('renders alert message correctly', () => {
        const wrapper = mount(Alert, {
            props: {
                type: 'success',
                title: 'Test Title',
                message: 'Test message',
                show: true
            }
        })

        expect(wrapper.find('.alert-success').exists()).toBe(true)
        expect(wrapper.text()).toContain('Test Title')
        expect(wrapper.text()).toContain('Test message')
    })

    it('emits dismiss event when close button is clicked', async () => {
        const wrapper = mount(Alert, {
            props: {
                type: 'info',
                message: 'Test message',
                show: true,
                dismissible: true
            }
        })

        const closeButton = wrapper.find('.alert-close')
        expect(closeButton.exists()).toBe(true)

        await closeButton.trigger('click')
        expect(wrapper.emitted().dismiss).toBeTruthy()
    })

    it('does not render when show is false', () => {
        const wrapper = mount(Alert, {
            props: {
                type: 'info',
                message: 'Test message',
                show: false
            }
        })

        expect(wrapper.find('.alert').exists()).toBe(false)
    })

    it('applies correct CSS class based on type', () => {
        const types = ['success', 'error', 'warning', 'info']

        types.forEach(type => {
            const wrapper = mount(Alert, {
                props: {
                    type,
                    message: 'Test message',
                    show: true
                }
            })

            expect(wrapper.find(`.alert-${type}`).exists()).toBe(true)
        })
    })
})