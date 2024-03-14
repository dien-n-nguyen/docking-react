import React, { useEffect, useState } from 'react';
import * as $3Dmol from '3dmol/build/3Dmol.js';
import './Viewer.css';
import ReceptorInput from '../ReceptorInput';
import LigandInput from '../LigandInput/LigandInput';
const MyViewerComponent = () => {

    const [viewer_obj, set_viewer_obj] = useState(null)
    const [surface, setSurface] = useState(null)
    const [selectedReceptor, setSelectedReceptor] = useState('')
    const [selectedLigand, setSelectedLigand] = useState('')
    const [ligandError, setLigandError] = useState('')
    const [receptorError, setReceptorError] = useState('')
    const [loading, setLoading] = useState(false)
    const [contactFreq, setcontactFreq] = useState(null)

    const handleLigandSelection = (selectedLigand) => {
        setSelectedLigand(selectedLigand)
    }
    const handleReceptorSelection = (selectedReceptor) => {
        setSelectedReceptor(selectedReceptor)
    }

    const surface_coloring = (contactFreq, atom) => {
        var d, d_inv, d_inv_text, d_text, color, pre_resi;
        const slicedLigand = selectedLigand.slice(0, -4)
        if (atom.resi in contactFreq[selectedReceptor][slicedLigand]) {
            d = Math.floor(contactFreq[selectedReceptor][slicedLigand][atom.resi] * 255)
            if (d.toString(16).length === 1) {
                d_text = "0" + d.toString(16);
            } else {
                d_text = d.toString(16);
            }
            d_inv = 255 - d;
            if (d_inv.toString(16).length === 1) {
                d_inv_text = "0" + d_inv.toString(16);
            } else {
                d_inv_text = "0" + d_inv.toString(16);
            }
            pre_resi = atom.resi;

            color = "0xff" + d_inv_text + "00";
            return color;
        } else {
            return "0xcccccc"
        }
    }

    const handleSubmit = (event) => {
        // Make GET request using fetch API
        event.preventDefault()
        if (!selectedReceptor.trim()) {
            setReceptorError("Receptor cannot be empty")
            return;
        } else if (!selectedLigand.trim()) {
            setLigandError("Ligand cannot be empty")
            return;
        }
        setSurface(null)
        setLoading(true)
        setReceptorError('')
        setLigandError('')
        const docking = selectedReceptor + '_' + selectedLigand.slice(0, -4)
        const slicedLigand = selectedLigand.slice(0, -4)
        fetch(`https://bar.utoronto.ca/api_test/snps/docking/${selectedReceptor}/${slicedLigand}`)
          .then(response => response.json())
          .then(data => {
            setcontactFreq(data.data);
            setLoading(false)
            if (data.wasSuccessful === false || 'message' in data || data.status === 429) {
                if (!('message' in data)) {
                    setReceptorError(data.error)
                } else {
                    setReceptorError('You\'re only allowed to perform 2 dockings per minute.')
                }
                
            } else {
                var glviewer = null;
	            var labels = [];
                const atomcallback = (atom, viewer) => {
                    if (atom.clickLabel === undefined || !atom.clickLabel instanceof $3Dmol.Label) {
                        atom.clickLabel = viewer.addLabel(atom.elem + atom.serial, {
                            fontSize: 14,
                            position: {
                                x: atom.x,
                                y: atom.y,
                                z: atom.z
                            },
                            backgroundColor: "black"
                        });
                        atom.clicked = true;
                    } else {
                        if (atom.clicked) {
                            const newstyle = atom.clickLabel.getStyle();
                            newstyle.backgroundColor = 0x66ccff;

                            viewer.setLabelStyle(atom.clickLabel, newstyle);
                            atom.clicked = !atom.clicked;
                        } else {
                            viewer.removeLabel(atom.clickLabel);
                            delete atom.clickLabel;
                            atom.clicked = false;
                        }

                    }
                };

                var viewer = $3Dmol.createViewer('viewer-container', {});
                viewer.setBackgroundColor(0xffffff);
                $3Dmol.get(`https://bar.utoronto.ca/HEX_RESULTS/${docking}/${docking}0001.pdb`, function(data){
                    var m = viewer.addModel(data, "pdb");

                    set_viewer_obj(viewer)
                    viewer.setBackgroundColor(0xD6D6D6);
                    var atoms = m.selectedAtoms({});

                    for (var i in atoms) {
                        var atom = atoms[i];
                        atom.clickable = true;
                        atom.callback = atomcallback;
                    }
                    viewer.addSurface($3Dmol.SurfaceType.VDW, {opacity:0.85,voldata: data, color:'blue'},{resn:'SDF'});
                    viewer.mapAtomProperties($3Dmol.applyPartialCharges);
                    viewer.zoomTo();
                    viewer.setStyle({},{stick:{}})
                    viewer.render();})
                    }
                })
                .catch(error => {
                    // Handle error
                    console.error('Error:', error);
                });
            }

    const setSphere = () => {
        viewer_obj.setStyle({},{sphere:{}});
        viewer_obj.render();
    }

    const setStick = () => {
        viewer_obj.setStyle({},{stick:{}});
        viewer_obj.render();
    }

    const zoomIn = () => {
        viewer_obj.zoom(2);
    }

    const zoomOut = () => {
        viewer_obj.zoom(0.5);
    }

    const removeLabels = () => {
        viewer_obj.removeAllLabels();
    }

    const viewHeatScale = () => {
        if (surface == null) {
            const surf = viewer_obj.addSurface($3Dmol.SurfaceType.SAS, { opacity: 0.8, colorfunc: surface_coloring.bind(null, contactFreq) }, 
            { chain: 'Z', invert: true });
            setSurface(surf)
        }
    }

    const removeHeatScale = () => {
        if (surface != null) {
            viewer_obj.removeSurface(surface.surfid)
            setSurface(null)
    }
    }

    return (
        <div className="container">
            <form classname="form-container" onSubmit={handleSubmit}>
                <ReceptorInput onInput={handleReceptorSelection}/>
                {receptorError && <div style={{ color: 'red' , textAlign: 'left'}}>{receptorError}</div>}
                <LigandInput onSelect={handleLigandSelection}/>
                {ligandError && <div style={{ color: 'red' , textAlign: 'left'}}>{ligandError}</div>}
                <button className="form-button-container" type="submit">Run HEX docking</button>
            </form>
            {loading ? (
                <div>Loading ...</div>
            ) : (
                <div></div>
            )}
            <div className='viewer-container' id="viewer-container" style={{ height: '400px', width: '400px', position: 'relative' }}/>
            <div className='buttons-container'>
                <button onClick={setSphere}>Sphere</button>
                <button onClick={setStick}>Stick</button>
                <button onClick={zoomIn}>Zoom in</button>
                <button onClick={zoomOut}>Zoom out</button>
                <button onClick={removeLabels}>Remove labels</button>
                <button onClick={viewHeatScale}>View heatscale</button>
                <button onClick={removeHeatScale}>Remove heatscale</button>
            </div>
        </div>
    );
};

export default MyViewerComponent;
