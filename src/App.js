import './App.css';

import React, { Component } from 'react';
import styled from 'styled-components';
import parseSMS from './helpers/parseSmsText';
import createDownloadIcsLink, { createIcsData } from './helpers/createIcs';

const AppWrapper = styled.div`
  font-size: 14px;
  max-width: 600px;
  margin: 0 auto;
`;

const Title = styled.h1`
  text-align: center;
  padding: 0 20px;
`;

const Button = styled.button`
  font-size: 16px;
  padding: 1em 3em;
  outline: none;
  width: 100%;
  border: none;
  background-color: mediumaquamarine;
  cursor: pointer;

  &:disabled {
    background: transparent;
    border: 2px dashed gainsboro;
  }
`;

const DownloadLink = styled.a`
  font-size: 16px;
  padding: 1em 3em;
  outline: none;
  width: 100%;
  border: none;
  color: black;
  text-decoration: none;
  margin-top: 2em;
  display: block;
  background-color: mediumaquamarine;
  text-align: center;
`;

const Form = styled.form`
  width: 100%;
  padding: 0 2em 2em 2em;

  textarea {
    width: 100%;
    height: 30vh;
    max-height: 400px;
    font-size: 12px;
    border: 1px solid gray;
    margin-bottom: 1em;
  }
`;

const ShiftWrapper = styled.div`
  padding: 2em;

  ul {
    max-width: 450px;
  }
`;

const Shift = styled.li`
  display: flex;
  justify-content: stretch;
  text-align: left;

  span {
    flex: 0.8;
    &:first-child {
      flex: 1.2;
    }
  }
`;

const Location = styled.h4`
  margin-top: 0;
`;

const ErrorMessage = styled.div`
  padding: 1em;
  margin: 0.5em 0;
  background-color: crimson;
  color: white;
`;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rawSmsText: '',
      parsedSmsText: null,
      downloadLink: null,
      error: null
    };
  }

  handleSubmit = e => {
    e.preventDefault();
    try {
      const parsedData = parseSMS(this.state.rawSmsText);
      this.setState(
        {
          parsedSmsText: parsedData
        },
        () => {
          this.handleGetIcsFile(parsedData);
        }
      );
    } catch (e) {
      console.error(e);
      const err = new Error(
        'Klarte ikke tolke SMS tekst, kopier tekst på nytt fra SMS eller bestikk utvikleren'
      );
      this.setState({ error: err });
    }
  };

  handleType = e => {
    this.setState({
      rawSmsText: e.target.value,
      error: null
    });
  };

  handleGetIcsFile = data => {
    const requestbody = createIcsData(data);

    fetch('/api/calender', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestbody)
    })
      .then(response => response.json())
      .then(events => {
        const link = createDownloadIcsLink(events);
        this.setState({
          downloadLink: link
        });
      })
      .catch(e => {
        console.error(e);
        const err = new Error(
          'Server klarer ikke å generere kalenderfil, bestikk utvikleren for å fikse'
        );
        this.setState({ error: err });
      });
  };

  render() {
    const weeks = this.state.parsedSmsText;
    return (
      <AppWrapper className="App">
        <Title>Lag kalender av vaktliste-SMS</Title>
        <Form onSubmit={this.handleSubmit}>
          <label htmlFor="sms">Lim inn SMS:</label>
          <textarea
            id="sms"
            value={this.state.rawSmsText}
            onChange={this.handleType}
          />
          <Button disabled={!Boolean(this.state.rawSmsText)} type="submit">
            Konverter SMS
          </Button>
          {this.state.error && (
            <ErrorMessage>{this.state.error.message}</ErrorMessage>
          )}
        </Form>
        <ShiftWrapper>
          <p>
            Vennligst sjekk at alle vaktene stemmer. Denne løsningen er rasket
            sammen og jeg kan ikke garantere at den ikke inneholder feil.
          </p>
          {weeks && <h2>Vakter</h2>}
          {weeks &&
            weeks.map(week => (
              <ul key={week.week}>
                <li>
                  <h3>Uke {week.week}</h3>
                  <Location>{week.location}</Location>
                  <ul>
                    {week.shifts.map(shift => (
                      <Shift key={shift.date.format('DD.MM.YYYY')}>
                        <span>{`${shift.date.format('dddd DD.MM.YY')}:`}</span>
                        <span>{`${shift.start} - ${shift.end} ${
                          shift.type
                        }`}</span>
                      </Shift>
                    ))}
                  </ul>
                </li>
              </ul>
            ))}
          {weeks && (
            <DownloadLink
              href={this.state.downloadLink}
              download="sms-vaktliste.ics"
            >
              Last ned til kalender
            </DownloadLink>
          )}
        </ShiftWrapper>
      </AppWrapper>
    );
  }
}

export default App;
