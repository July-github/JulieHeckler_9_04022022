/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from "@testing-library/user-event"
import {localStorageMock} from "../__mocks__/localStorage.js";


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then it should shown all the inputs of the form and the button 'Envoyer'", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      expect(screen.getByText("Type de dépense")).toBeTruthy()
      expect(screen.getByText("Nom de la dépense")).toBeTruthy()
      expect(screen.getByText("Date")).toBeTruthy()
      expect(screen.getByText("Montant TTC")).toBeTruthy()
      expect(screen.getByText("TVA")).toBeTruthy()
      expect(screen.getByText("Commentaire")).toBeTruthy()
      expect(screen.getByText("Justificatif")).toBeTruthy()
      expect(screen.getByText("Envoyer")).toBeTruthy()
    })
  })

  describe("When I am on NewBill Page and I click on button 'Choisir un fichier' ", () => {
    test("Then the function handleChangeFile is called", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const send = screen.getByTestId("file")
      const handleChangeFile = jest.fn()
      send.addEventListener("click", handleChangeFile)
      userEvent.click(send);
      expect(handleChangeFile).toHaveBeenCalled()

    })
  })

  /*describe("When I am on NewBill Page and I have clicked on button 'Choisir un fichier' ", () => {
    test("Then the file is stored in the form", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

    })
  })*/

  describe("When I am on NewBill Page and I click on submit button", () => {
    test("Then the function handleSubmit is called", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const bill = {
        type: "transports",
        name: "john",
        date:"01/01/1970",
        vat:"20",
        pct:"70",
        commentary:"ok",
        preventDefault: () => {
        }
      };
      const html = NewBillUI()
      document.body.innerHTML = html
      const store = null
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const newBill = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })
      const form = screen.getByText("Envoyer")
      const handleSubmit = jest.fn(newBill.handleSubmit)
      form.addEventListener("click", handleSubmit(bill))
      userEvent.click(form);
      expect(handleSubmit).toHaveBeenCalled()
    })
  })

})
